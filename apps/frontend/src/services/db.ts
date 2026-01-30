import { Issue, Comment, User, UserRole } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --- Types ---
interface IDatabase {
    getUserByEmail(email: string, token: string): Promise<User | null>;
    createUser(id: string, email: string, role: UserRole, displayName: string, token: string): Promise<User>;
    ensureUserExists(id: string, email: string, role: UserRole, displayName: string, token: string, tenantId?: string): Promise<User>;
    updateUserRole(email: string, role: UserRole, token: string, tenantId?: string): Promise<User>;
    getAllUsers(token: string): Promise<User[]>; // Not explicitly implemented in backend?
    softDeleteUser(id: string, token: string): Promise<void>; // Not implemented in backend
    getUser(id: string, token: string): Promise<User | undefined>; // Not implemented
    getIssues(token: string): Promise<Issue[]>;
    getIssueById(id: string, token: string): Promise<Issue | undefined>;
    createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Issue>;
    updateIssue(id: string, updates: Partial<Issue>, token: string): Promise<Issue | undefined>;
    deleteIssue(id: string, token: string): Promise<void>;
    restoreIssue(id: string, token: string): Promise<void>;
    getCommentsByIssue(issueId: string, token: string): Promise<Comment[]>;
    addComment(comment: Omit<Comment, 'id' | 'createdAt'>, token: string): Promise<Comment>;
    fixSchema(token: string): Promise<any>;
}

// --- API Implementation ---
class ApiDatabase implements IDatabase {

    private async fetch(endpoint: string, token: string, options: RequestInit = {}) {
        let tenantId = 'tenant1'; // Default
        if (typeof window !== 'undefined') {
            try {
                const storageRaw = localStorage.getItem('onesaas-auth-storage');
                if (storageRaw) {
                    const parsed = JSON.parse(storageRaw);
                    if (parsed.state && parsed.state.tenantId) {
                        tenantId = parsed.state.tenantId;
                    }
                }
            } catch (e) {
                console.error("Error parsing auth storage for tenantId in db.ts", e);
            }
        }

        // DEBUG LOGGING
        console.log(`[ApiDatabase] Fetching ${endpoint} with Tenant: ${tenantId}`);
        // console.log(`[ApiDatabase] Token: ${token ? token.substring(0, 10) + '...' : 'MISSING'}`);

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId,
                ...options.headers,
            },
        });
        if (res.status === 404) return null;
        if (!res.ok) {
            let errorMessage = res.statusText;
            try {
                const error = await res.json();
                console.error('[ApiDatabase] Error Detail:', error);
                errorMessage = error.message || errorMessage;
            } catch {
                // Response body is empty (e.g. 401/403)
                console.error('[ApiDatabase] Error status:', res.status);
            }
            throw new Error(errorMessage || res.statusText);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }

    private mapUser(u: any): User {
        if (!u) return u;
        return {
            id: u.id,
            email: u.email,
            role: u.role,
            displayName: u.display_name || u.displayName || 'Unknown'
        };
    }

    async getUserByEmail(email: string, token: string): Promise<User | null> {
        const data = await this.fetch(`/users/by-email?email=${encodeURIComponent(email)}`, token);
        return this.mapUser(data);
    }

    async createUser(id: string, email: string, role: UserRole, displayName: string, token: string): Promise<User> {
        const data = await this.fetch('/users', token, {
            method: 'POST',
            body: JSON.stringify({ id, email, role, display_name: displayName })
        });
        return this.mapUser(data);
    }


    async ensureUserExists(id: string, email: string, role: UserRole, displayName: string, token: string, tenantId: string = 'tenant1'): Promise<User> {
        const existing = await this.getUserByEmail(email, token);
        if (existing) return existing;
        return this.createUser(id, email, role, displayName, token);
    }

    async updateUserRole(email: string, role: UserRole, token: string, tenantId: string = 'tenant1'): Promise<User> {
        const data = await this.fetch(`/users/${encodeURIComponent(email)}/role`, token, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
            headers: {
                'x-tenant-id': tenantId
            }
        });
        return this.mapUser(data);
    }

    async getAllUsers(token: string): Promise<User[]> {
        const data = await this.fetch('/users', token);
        return (data || []).map((u: any) => this.mapUser(u));
    }


    async softDeleteUser(id: string, token: string): Promise<void> {
        await this.fetch(`/users/${id}`, token, { method: 'DELETE' }); // If implemented
    }

    async getUser(id: string, token: string): Promise<User | undefined> {
        const data = await this.fetch(`/users/${id}`, token);
        return this.mapUser(data) || undefined;
    }



    async getIssues(token: string): Promise<Issue[]> {
        return this.fetch('/issues', token);
    }

    async getIssueById(id: string, token: string): Promise<Issue | undefined> {
        const res = await this.fetch(`/issues/${id}`, token);
        return res || undefined;
    }

    async createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Issue> {
        return this.fetch('/issues', token, {
            method: 'POST',
            body: JSON.stringify(issue)
        });
    }

    async updateIssue(id: string, updates: Partial<Issue>, token: string): Promise<Issue | undefined> {
        return this.fetch(`/issues/${id}`, token, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async deleteIssue(id: string, token: string): Promise<void> {
        await this.fetch(`/issues/${id}`, token, { method: 'DELETE' });
    }

    async restoreIssue(id: string, token: string): Promise<void> {
        await this.fetch(`/issues/${id}/restore`, token, { method: 'PATCH' });
    }

    async getCommentsByIssue(issueId: string, token: string): Promise<Comment[]> {
        return this.fetch(`/issues/${issueId}/comments`, token);
    }

    async addComment(comment: Omit<Comment, 'id' | 'createdAt'>, token: string): Promise<Comment> {
        return this.fetch(`/issues/${comment.issueId}/comments`, token, {
            method: 'POST',
            body: JSON.stringify({ text: comment.text, createdBy: comment.createdBy })
        });
    }

    async fixSchema(token: string) {
        return this.fetch('/issues/fix/schema', token, {
            method: 'GET'
        });
    }
}

// Select DB implementation
// Uses mock database when:
// 1. NEXT_PUBLIC_API_URL is missing (undefined/empty)
// 2. NEXT_PUBLIC_API_URL contains 'localhost'
// 3. NEXT_PUBLIC_API_URL is explicitly set to 'mock'
// 4. NEXT_PUBLIC_USE_MOCK is explicitly set to 'true'
const shouldUseMock =
    !process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL === '' ||
    process.env.NEXT_PUBLIC_API_URL.includes('localhost') ||
    process.env.NEXT_PUBLIC_API_URL === 'mock' ||
    process.env.NEXT_PUBLIC_USE_MOCK === 'true';

import { mockDb } from './mockDb';

export const db: IDatabase = shouldUseMock ? mockDb : new ApiDatabase();

if (shouldUseMock) {
    console.warn('⚠️ [Mock Mode] Using Mock Database because NEXT_PUBLIC_API_URL is missing or local.');
}
