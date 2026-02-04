import { Injectable, InternalServerErrorException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateIssueDto, UpdateIssueDto } from './dto/issue.dto';
import { NovuService } from '../notifications/novu.service';

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly novuService: NovuService,
  ) { }

  private mapIssue(i: any) {
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      image: i.image,
      status: i.status || 'open',
      priority: i.priority || 'medium',
      createdBy: i.created_by,
      assignedTo: i.assigned_to,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    };
  }

  private mapComment(c: any) {
    return {
      id: c.id,
      issueId: c.issue_id,
      text: c.message,
      createdBy: c.created_by,
      createdAt: c.created_at
    };
  }

  private getSafeSchema(tenantId: string) {
    if (!tenantId) return 'public';
    // Map default UUID to tenant1
    if (tenantId === '11111111-1111-1111-1111-111111111111') return 'tenant1';

    if (!/^[a-z0-9_-]+$/i.test(tenantId)) return 'public';
    return tenantId;
  }

  async findAll(tenantId: string) {
    this.logger.log(`Finding all issues for tenant: ${tenantId}`);
    const schema = this.getSafeSchema(tenantId);
    try {
      const result = await this.databaseService.query(
        `SELECT * FROM "${schema}".issues WHERE deleted_at IS NULL ORDER BY created_at DESC`
      );
      return result.rows.map(this.mapIssue);
    } catch (error) {
      this.logger.error(`Error executing SQL`, error);
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async findOne(id: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      const result = await this.databaseService.query(
        `SELECT * FROM "${schema}".issues WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (result.rows.length === 0) throw new NotFoundException(`Issue ${id} not found`);
      return this.mapIssue(result.rows[0]);
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  private async getUser(userId: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      const result = await this.databaseService.query(
        `SELECT * FROM "${schema}".users WHERE id = $1 AND deleted_at IS NULL`,
        [userId]
      );
      if (result.rows.length > 0) {
        const u = result.rows[0];
        return {
          id: u.id,
          email: u.email,
          name: u.display_name,
        };
      }
    } catch (e) {
      this.logger.warn(`Failed to fetch user ${userId} for notification`, e);
    }
    return userId; // Fallback to ID string
  }

  async create(createDto: CreateIssueDto, tenantId: string, userContext?: { email?: string, name?: string }) {
    const schema = this.getSafeSchema(tenantId);
    try {
      this.logger.log(`Creating issue for tenant ${tenantId}`, createDto);
      const result = await this.databaseService.query(
        `INSERT INTO "${schema}".issues (title, description, status, priority, created_by, assigned_to, image) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          createDto.title,
          createDto.description,
          createDto.status || 'open',
          createDto.priority || 'medium',
          createDto.createdBy,
          createDto.assignedTo,
          createDto.image
        ]
      );

      const issue = this.mapIssue(result.rows[0]);

      // Trigger Notification
      let user = await this.getUser(createDto.createdBy, tenantId);

      // Fallback if user is just a string ID and we have context
      if (typeof user === 'string' && userContext?.email) {
        user = {
          id: userContext.email ? createDto.createdBy : user, // If we have email, we construct object
          email: userContext.email,
          name: userContext.name
        };
        this.logger.log(`Using fallback user context for Novu: ${JSON.stringify(user)}`);
      }

      await this.novuService.triggerEvent('issue-created-quye', tenantId, user, {
        issueId: issue.id,
        title: issue.title,
        priority: issue.priority,
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
      });

      return issue;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async update(id: string, updateDto: UpdateIssueDto, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updateDto.title) { fields.push(`title = $${idx++}`); values.push(updateDto.title); }
      if (updateDto.description) { fields.push(`description = $${idx++}`); values.push(updateDto.description); }
      if (updateDto.status) { fields.push(`status = $${idx++}`); values.push(updateDto.status); }
      if (updateDto.priority) { fields.push(`priority = $${idx++}`); values.push(updateDto.priority); }
      if (updateDto.assignedTo) { fields.push(`assigned_to = $${idx++}`); values.push(updateDto.assignedTo); }
      if ('image' in updateDto) { fields.push(`image = $${idx++}`); values.push(updateDto.image); }

      fields.push(`updated_at = NOW()`);

      values.push(id);
      const idIdx = idx++;

      const result = await this.databaseService.query(
        `UPDATE "${schema}".issues SET ${fields.join(', ')} WHERE id = $${idIdx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) throw new NotFoundException('Issue not found or access denied');
      const updatedIssue = this.mapIssue(result.rows[0]);

      // Trigger Notification for Status Change
      if (updateDto.status) {
        const targetUserId = updatedIssue.assignedTo || updatedIssue.createdBy;
        const user = await this.getUser(targetUserId, tenantId);
        await this.novuService.triggerEvent('issue-status-changed-474y', tenantId, user, {
          issueId: updatedIssue.id,
          title: updatedIssue.title,
          status: updatedIssue.status,
        });
      }

      // Trigger Notification for Assignment
      if (updateDto.assignedTo) {
        const user = await this.getUser(updateDto.assignedTo, tenantId);
        await this.novuService.triggerEvent('issue-assigned-7lg0', tenantId, user, {
          issueId: updatedIssue.id,
          title: updatedIssue.title,
        });
      }

      return updatedIssue;
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async delete(id: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      const result = await this.databaseService.query(
        `UPDATE "${schema}".issues SET deleted_at = NOW() WHERE id = $1`,
        [id]
      );
      return { deleted: true, id };
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async restore(id: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      await this.databaseService.query(
        `UPDATE "${schema}".issues SET deleted_at = NULL WHERE id = $1`,
        [id]
      );
      return { restored: true, id };
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async getCommentsByIssue(issueId: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      const result = await this.databaseService.query(
        `SELECT c.* FROM "${schema}".comments c
         JOIN "${schema}".issues i ON c.issue_id = i.id
         WHERE c.issue_id = $1 AND c.deleted_at IS NULL
         ORDER BY c.created_at ASC`,
        [issueId]
      );
      return result.rows.map(this.mapComment);
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async addComment(issueId: string, text: string, createdBy: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      // First verify issue exists
      const issue = await this.findOne(issueId, tenantId);
      if (!issue) throw new NotFoundException('Issue not found');

      const result = await this.databaseService.query(
        `INSERT INTO "${schema}".comments (issue_id, message, created_by) VALUES ($1, $2, $3) RETURNING *`,
        [issueId, text, createdBy]
      );

      // Trigger Notification
      const targetUserId = issue.assignedTo || issue.createdBy;
      const user = await this.getUser(targetUserId, tenantId);

      await this.novuService.triggerEvent('comment-added-b805', tenantId, user, {
        issueId: issue.id,
        issueTitle: issue.title,
        comment: text
      });

      return this.mapComment(result.rows[0]);
    } catch (error) {
      throw new InternalServerErrorException((error as any).message);
    }
  }

  async deleteComment(commentId: string, userId: string, role: string, tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      // 1. Fetch comment to check ownership
      const commentRes = await this.databaseService.query(
        `SELECT * FROM "${schema}".comments WHERE id = $1 AND deleted_at IS NULL`,
        [commentId]
      );

      if (commentRes.rows.length === 0) {
        throw new NotFoundException('Comment not found');
      }

      const comment = commentRes.rows[0];

      // 2. Check permissions
      // Admin can delete any. Member can delete only their own.
      if (role !== 'admin' && comment.created_by !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      // 3. Soft delete
      await this.databaseService.query(
        `UPDATE "${schema}".comments SET deleted_at = NOW() WHERE id = $1`,
        [commentId]
      );

      return { deleted: true, id: commentId };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException((error as any).message);
    }
  }
  async fixSchema(tenantId: string) {
    const schema = this.getSafeSchema(tenantId);
    try {
      this.logger.log(`Fixing schema for ${schema}`);
      await this.databaseService.query(
        `ALTER TABLE "${schema}".users ADD COLUMN IF NOT EXISTS role text not null default 'viewer' check (role in ('admin', 'member', 'viewer'))`
      );
      await this.databaseService.query(
        `ALTER TABLE "${schema}".users ADD COLUMN IF NOT EXISTS display_name text`
      );
      await this.databaseService.query(
        `ALTER TABLE "${schema}".issues ADD COLUMN IF NOT EXISTS image text`
      );
    } catch (error) {
      this.logger.error(`Error fixing schema`, error);
    }
  }
}


