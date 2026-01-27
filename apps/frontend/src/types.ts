// Data Models matching the PRD

export enum UserRole {
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer'
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    displayName: string;
}

export enum IssueStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed'
}

export interface Issue {
    id: string; // UUID
    title: string; // 3-120 chars
    description: string;
    status: IssueStatus;
    createdBy: string; // user_id
    assignedTo: string | null; // user_id
    createdAt: string; // timestamp
    updatedAt: string; // timestamp
}

export interface Comment {
    id: string; // UUID
    issueId: string;
    text: string;
    createdBy: string; // user_id
    createdAt: string; // timestamp
}

// Service Response Wrappers
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}
