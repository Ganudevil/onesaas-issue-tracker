import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export class CreateIssueDto {
  @ApiProperty({
    description: 'Issue title',
    minLength: 3,
    maxLength: 120,
    example: 'Fix login button not working',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The login button on the homepage does not respond when clicked.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded image string',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Current status of the issue',
    enum: IssueStatus,
    default: IssueStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiProperty({
    description: 'UUID of the user who created the issue',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  createdBy: string;

  @ApiPropertyOptional({
    description: 'UUID of the user assigned to this issue',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
  @ApiPropertyOptional({
    description: 'Priority of the issue',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateIssueDto {
  @ApiPropertyOptional({
    description: 'Issue title',
    minLength: 3,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the issue',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded image string',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Current status of the issue',
    enum: IssueStatus,
  })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiPropertyOptional({
    description: 'UUID of the user assigned to this issue',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
  @ApiPropertyOptional({
    description: 'Priority of the issue',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class IssueResponseDto {
  @ApiProperty({ description: 'Unique identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Issue title' })
  title: string;

  @ApiProperty({ description: 'Issue description' })
  description: string;

  @ApiPropertyOptional({ description: 'Base64 encoded image string' })
  image?: string;

  @ApiProperty({ enum: IssueStatus, description: 'Current status' })
  status: IssueStatus;

  @ApiProperty({ description: 'Priority level', example: 'medium' })
  priority: string;

  @ApiProperty({ description: 'Creator user ID', format: 'uuid' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Assigned user ID', format: 'uuid' })
  assignedTo?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({ description: 'Creator user ID', format: 'uuid' })
  @IsUUID()
  createdBy: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'Unique identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Issue ID', format: 'uuid' })
  issueId: string;

  @ApiProperty({ description: 'Comment text' })
  text: string;

  @ApiProperty({ description: 'Creator user ID', format: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}

