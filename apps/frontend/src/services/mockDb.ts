import { Issue, Comment, User, UserRole, IssueStatus } from '../types';
import MockNotificationService from './mockNotificationService';

// In-memory store
let issuesStore: Issue[] = [
    {
        id: 'mock-issue-1',
        title: 'Welcome to OneSAAS (Mock Mode)',
        description: 'This is a sample issue loaded because the backend is not reachable. You can add more issues, and they will be saved to your browser memory.',
        status: IssueStatus.OPEN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        assignedTo: null
    }
];

let commentsStore: Comment[] = [
    {
        id: 'mock-comment-1',
        text: 'This is a mock comment to demonstrate the UI.',
        issueId: 'mock-issue-1',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    }
];

// Mock persistent user store
let mockUserStore = {
    id: 'mock-user-123',
    email: 'demo@onesaas.local',
    role: UserRole.ADMIN,
    displayName: 'Demo User'
};

// Mock database service
export const mockDb = {
    async getUser(id: string, token: string): Promise<User | undefined> {
        return { ...mockUserStore, id };
    },

    async getUserByEmail(email: string, token: string): Promise<User | null> {
        // Return the stored user state
        return { ...mockUserStore, email };
    },

    async createUser(id: string, email: string, role: UserRole, displayName: string, token: string): Promise<User> {
        mockUserStore = { id, email, role, displayName };
        return { ...mockUserStore };
    },

    async ensureUserExists(id: string, email: string, role: UserRole, displayName: string, token: string, tenantId: string = 'tenant1'): Promise<User> {
        // Always return the stored user state to persist role changes
        return { ...mockUserStore, email };
    },

    async updateUserRole(email: string, role: UserRole, token: string, tenantId: string = 'tenant1'): Promise<User> {
        // In a real app, we'd store roles per tenant.
        // For simple mock, we just update the global mock user.
        mockUserStore.role = role;
        return { ...mockUserStore, email };
    },

    async getAllUsers(token: string): Promise<User[]> {
        return [{ ...mockUserStore }];
    },

    async softDeleteUser(id: string, token: string): Promise<void> {
        // No-op for mock
    },

    async getIssues(token: string): Promise<Issue[]> {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));
        return [...issuesStore];
    },

    async getIssueById(id: string, token: string): Promise<Issue | undefined> {
        await new Promise(r => setTimeout(r, 300));
        return issuesStore.find(i => i.id === id);
    },

    async createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Issue> {
        const newIssue: Issue = {
            ...issue,
            id: `mock-issue-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        issuesStore.push(newIssue);
        console.log('[MockDB] Created issue:', newIssue);

        // Trigger mock notification
        MockNotificationService.notifyIssueCreated(newIssue, 'You');

        return newIssue;
    },

    async updateIssue(id: string, updates: Partial<Issue>, token: string): Promise<Issue | undefined> {
        const index = issuesStore.findIndex(i => i.id === id);
        if (index === -1) return undefined;

        issuesStore[index] = { ...issuesStore[index], ...updates, updatedAt: new Date().toISOString() };
        return issuesStore[index];
    },

    async deleteIssue(id: string, token: string): Promise<void> {
        issuesStore = issuesStore.filter(i => i.id !== id);
    },

    async restoreIssue(id: string, token: string): Promise<void> {
        // No-op for mock
    },

    async getCommentsByIssue(issueId: string, token: string): Promise<Comment[]> {
        return commentsStore.filter(c => c.issueId === issueId);
    },

    async addComment(comment: Omit<Comment, 'id' | 'createdAt'>, token: string): Promise<Comment> {
        const newComment: Comment = {
            ...comment,
            id: `mock-comment-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        commentsStore.push(newComment);

        // Trigger mock notification
        const issue = issuesStore.find(i => i.id === comment.issueId);
        if (issue) {
            MockNotificationService.notifyCommentAdded(issue, comment.text, 'You');
        }

        return newComment;
    },

    async fixSchema(token: string) {
        return { status: 'mock_fixed' };
    }
};
