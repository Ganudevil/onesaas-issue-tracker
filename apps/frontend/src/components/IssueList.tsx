'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { db } from '../services/db';
import { IssueCard } from './IssueCard';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole, Issue, User } from '../types';
import { Plus, Loader2 } from 'lucide-react';
import { useIssuesControllerFindAll } from '../services/api';

interface IssueListProps {
    onNavigate?: (page: string, id?: string) => void;
    onlyMyIssues?: boolean;
}

export const IssueList: React.FC<IssueListProps> = ({ onNavigate, onlyMyIssues = false }) => {
    const { user, token, tenantId, role } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);

    // Use generated hook for issues
    const { data: issuesData, isLoading: issuesLoading, error, refetch } = useIssuesControllerFindAll();
    const issues = (issuesData || []) as Issue[];

    useEffect(() => {
        refetch();
    }, [tenantId, refetch]);

    useEffect(() => {
        // Keep users fetching as legacy for now until User API is ready
        const fetchUsers = async () => {
            if (token) {
                const fetchedUsers = await db.getAllUsers(token);
                setUsers(fetchedUsers);
            }
        };
        fetchUsers();
    }, [token]);

    const loading = issuesLoading;

    const filteredIssues = useMemo(() => {
        if (onlyMyIssues && user) {
            return issues.filter(i => i.assignedTo === user.id);
        }
        return issues;
    }, [issues, onlyMyIssues, user]);

    const canCreate = role === UserRole.ADMIN || role === UserRole.MEMBER;
    const canDelete = role === UserRole.ADMIN;

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this issue?')) return;
        if (!token) return;
        try {
            await db.deleteIssue(id, token);
            refetch(); // Refetch issues after delete
        } catch (error) {
            console.error("Failed to delete issue", error);
            alert("Failed to delete issue");
        }
    };

    // Helper to get user details without async lookups in child
    const getUserById = (id: string | null) => users.find(u => u.id === id);

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-black">
                        {onlyMyIssues ? 'My Assigned Issues' : 'All Issues'}
                    </h1>
                    <p className="text-gray-800 text-sm mt-1">
                        Manage and track your project tasks.
                    </p>
                </div>
                {canCreate && !onlyMyIssues && (
                    <Button onClick={() => onNavigate?.('create')} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        New Issue
                    </Button>
                )}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredIssues.map(issue => (
                    <IssueCard
                        key={issue.id}
                        issue={issue}
                        createdUser={getUserById(issue.createdBy)}
                        assignedUser={getUserById(issue.assignedTo)}
                        onClick={() => onNavigate?.('detail', issue.id)}
                        onDelete={canDelete ? handleDelete : undefined}
                    />
                ))}
                {!!error && (
                    <div className="col-span-full text-center py-12 text-red-500">
                        <p>Error loading issues: {(error as any).response?.data?.message || "Failed to fetch issues."}</p>
                        <p className="text-sm">Please check your connection or login status.</p>
                    </div>
                )}
                {!error && filteredIssues.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-slate-500">No issues found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
