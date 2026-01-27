import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) { }

    private mapUser(u: any) {
        if (!u) return null;
        return {
            id: u.id,
            email: u.email,
            role: u.role,
            display_name: u.display_name,
            created_at: u.created_at,
            updated_at: u.updated_at
        };
    }

    private getSafeSchema(tenantId: string) {
        if (!tenantId) return 'public';
        if (tenantId === '11111111-1111-1111-1111-111111111111') return 'tenant1';
        if (!/^[a-z0-9_-]+$/i.test(tenantId)) return 'public';
        return tenantId;
    }

    async getUserByEmail(email: string, tenantId: string = 'tenant1') {
        const schema = this.getSafeSchema(tenantId);
        try {
            const result = await this.databaseService.query(
                `SELECT * FROM "${schema}".users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
                [email]
            );
            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error('Error in getUserByEmail:', error);
            throw new InternalServerErrorException((error as any).message);
        }
    }

    async create(user: any, tenantId: string = 'tenant1') {
        const schema = this.getSafeSchema(tenantId);
        try {
            // Check if user exists first to avoid duplicate key error if race condition
            // But let's rely on constraint.
            console.log(`[UsersService] Creating user ${user.id} / ${user.email} in ${schema} with role member`);
            const result = await this.databaseService.query(
                `INSERT INTO "${schema}".users (id, email, role, display_name) VALUES ($1, $2, $3, $4) RETURNING *`,
                [user.id, user.email, user.role || 'member', user.display_name]
            );
            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error('Error in create:', error);
            throw new InternalServerErrorException((error as any).message);
        }
    }

    async updateRole(email: string, role: string, tenantId: string = 'tenant1') {
        const schema = this.getSafeSchema(tenantId);
        try {
            const result = await this.databaseService.query(
                `UPDATE "${schema}".users SET role = $1, updated_at = NOW() WHERE email = $2 AND deleted_at IS NULL RETURNING *`,
                [role, email]
            );
            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error('Error in updateRole:', error);
            throw new InternalServerErrorException((error as any).message);
        }
    }

    async getAllUsers(tenantId: string = 'tenant1') {
        const schema = this.getSafeSchema(tenantId);
        try {
            const result = await this.databaseService.query(
                `SELECT * FROM "${schema}".users WHERE deleted_at IS NULL ORDER BY created_at DESC`
            );
            return result.rows.map(this.mapUser.bind(this));
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw new InternalServerErrorException((error as any).message);
        }
    }

    async getUserById(id: string, tenantId: string = 'tenant1') {
        const schema = this.getSafeSchema(tenantId);
        try {
            const result = await this.databaseService.query(
                `SELECT * FROM "${schema}".users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
                [id]
            );
            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error('Error in getUserById:', error);
            throw new InternalServerErrorException((error as any).message);
        }
    }
}
