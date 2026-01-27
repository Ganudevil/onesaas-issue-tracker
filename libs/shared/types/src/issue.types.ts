// Copy from frontend/src/types.ts
export enum UserRole {
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer',
}

export enum IssueStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed',
}

export enum IssuePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    displayName?: string;
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    createdBy: string;
    assignedTo: string | null;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
}

export interface Comment {
    id: string;
    issueId: string;
    text: string;
    createdBy: string;
    createdAt: string;
}
