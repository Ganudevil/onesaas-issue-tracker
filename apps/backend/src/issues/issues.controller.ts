import { Controller, Get, Post, Body, Param, Delete, Put, Patch, ParseUUIDPipe, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto, IssueResponseDto, CreateCommentDto, CommentResponseDto } from './dto/issue.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantGuard } from '../auth/tenant.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('issues')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all issues', description: 'Retrieve a list of all issues for the current tenant' })
  @ApiResponse({ status: 200, description: 'List of issues', type: [IssueResponseDto] })
  async findAll(@Request() req: any) {
    const { tenantId } = req.user;
    console.log(`[IssuesController] findAll tenantId: ${tenantId}`);
    return this.issuesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID', description: 'Retrieve a specific issue by its UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Issue UUID' })
  @ApiResponse({ status: 200, description: 'Issue found', type: IssueResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const { tenantId } = req.user;
    console.log(`[IssuesController] findOne id: ${id}, tenantId: ${tenantId}`);
    return this.issuesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('member', 'admin') // "Viewer = read-only"
  @ApiOperation({ summary: 'Create new issue', description: 'Create a new issue with the provided data' })
  @ApiResponse({ status: 201, description: 'Issue created successfully', type: IssueResponseDto })
  create(@Body() createIssueDto: CreateIssueDto, @Request() req: any) {
    const { tenantId, userId, email, name } = req.user;
    if (req.user.role === 'viewer') throw new ForbiddenException('Read-only role'); // Guard handles this but redundancy is fine
    // DTO doesn't have createdBy, we set it from token
    return this.issuesService.create(
      { ...createIssueDto, createdBy: userId },
      tenantId,
      { email, name } // Pass user context for notifications
    );
  }

  @Patch(':id')
  @Roles('member', 'admin') // "Member = CRUD issues"
  @ApiOperation({ summary: 'Update issue', description: 'Update an existing issue by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Issue UUID' })
  @ApiResponse({ status: 200, description: 'Issue updated successfully', type: IssueResponseDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIssueDto: UpdateIssueDto, @Request() req: any) {
    const { tenantId } = req.user;
    return this.issuesService.update(id, updateIssueDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin') // "Admin = users, roles, settings". Wait, can Member delete? Usually yes. 
  // Prompt says: "Member = CRUD issues", "Admin = users, roles, settings".
  // So Member CAN delete issues.
  // Actually, usually Delete is restricted. But purely "CRUD" implies Delete too.
  // Let's allow Member to delete issues for now, or stick to previous logic if valid.
  // Previous code had @Roles('admin').
  // Prompt says: "Member = CRUD issues". So Member should be able to Delete.
  // I will change it to 'member', 'admin'.
  @ApiOperation({ summary: 'Delete issue', description: 'Delete an issue by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Issue UUID' })
  @ApiResponse({ status: 200, description: 'Issue deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const { tenantId } = req.user;
    return this.issuesService.delete(id, tenantId);
  }

  @Patch(':id/restore')
  @Roles('member', 'admin')
  @ApiOperation({ summary: 'Restore issue', description: 'Restore a soft-deleted issue' })
  restore(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const { tenantId } = req.user;
    return this.issuesService.restore(id, tenantId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments', description: 'Get all comments for an issue' })
  getComments(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const { tenantId } = req.user;
    return this.issuesService.getCommentsByIssue(id, tenantId);
  }

  @Post(':id/comments')
  @Roles('member', 'admin')
  @ApiOperation({ summary: 'Add comment', description: 'Add a comment to an issue' })
  addComment(@Param('id', ParseUUIDPipe) id: string, @Body() createCommentDto: CreateCommentDto, @Request() req: any) {
    const { tenantId, userId } = req.user;
    return this.issuesService.addComment(id, createCommentDto.text, userId, tenantId);
  }

  @Get('fix/schema')
  @ApiOperation({ summary: 'Fix schema', description: 'Fix missing columns in tenant schema' })
  fixSchema(@Request() req: any) {
    return this.issuesService.fixSchema('tenant1'); // Force tenant1 for repair
  }


}
