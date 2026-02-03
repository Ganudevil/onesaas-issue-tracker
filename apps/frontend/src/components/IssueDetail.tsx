'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { UserRole, IssueStatus, Issue, User } from '../types';
import { CommentList } from './CommentList';
import { ArrowLeft, Edit2, CheckCircle, User as UserIcon, Calendar, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IssueDetailProps {
    id: string;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ id }) => {
    const { user, token, role } = useAuthStore();
    const router = useRouter(); // Use Next.js Navigation
    const [issue, setIssue] = useState<Issue | null>(null);
    const [createdUser, setCreatedUser] = useState<User | undefined>(undefined);
    const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const i = await db.getIssueById(id, token);
                if (i) {
                    setIssue(i);
                    const [cUser, aUser] = await Promise.all([
                        db.getUser(i.createdBy, token),
                        i.assignedTo ? db.getUser(i.assignedTo, token) : undefined
                    ]);
                    setCreatedUser(cUser);
                    setAssignedUser(aUser);
                }
            } catch (err: any) {
                console.error("Failed to fetch issue details", err);
                if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
                    // Optionally redirect or set state to show access denied
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, tick, token]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!issue) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-xl font-semibold mb-2">Issue not found</h2>
                <p className="text-gray-500 mb-6">The issue you are looking for does not exist or you do not have permission to view it.</p>
                <Button onClick={() => router.push('/issues')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </div>
        );
    }

    const canEdit = role === UserRole.ADMIN || (role === UserRole.MEMBER && user?.id === issue.createdBy);
    const canClose = role === UserRole.ADMIN;
    const canDelete = role === UserRole.ADMIN;

    const handleClose = async () => {
        if (!token) return;
        await db.updateIssue(issue.id, { status: IssueStatus.CLOSED }, token);
        setTick(t => t + 1);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
        if (!token) return;
        try {
            await db.deleteIssue(issue.id, token);
            router.push('/issues');
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete issue");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2 sm:ml-0" onClick={() => router.push('/issues')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </div>

            <div className="bg-[#2A1E41] backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden text-slate-100">
                <div className="p-4 sm:p-6 border-b border-white/10 bg-[#1F2022]">
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{issue.title}</h1>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${STATUS_COLORS[issue.status]}`}>
                                    {STATUS_LABELS[issue.status]}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 gap-2 sm:gap-4">
                                <div className="flex items-center">
                                    <UserIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">Created by {createdUser?.displayName || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {canEdit && (
                                <Button variant="secondary" size="sm" onClick={() => router.push(`/issues/${issue.id}/edit`)}>
                                    <Edit2 className="h-3 w-3 mr-2" />
                                    Edit
                                </Button>
                            )}
                            {canDelete && (
                                <Button variant="danger" size="sm" onClick={handleDelete}>
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                </Button>
                            )}
                            {canClose && issue.status !== IssueStatus.CLOSED && (
                                <Button variant="primary" size="sm" onClick={handleClose}>
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    Close Issue
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-[#B0B3C0] mb-2">Description</h3>
                            <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                                {issue.description}
                            </p>
                        </div>

                        <div className="pt-6 border-t">
                            <CommentList issueId={issue.id} refreshTrigger={tick} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#1F2022] p-4 rounded-lg border border-white/10">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                Details
                            </h4>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-slate-400 text-xs mb-1">Assigned To</span>
                                    <div className="flex items-center">
                                        {assignedUser ? (
                                            <>
                                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-2">
                                                    {assignedUser.displayName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-100">{assignedUser.displayName}</span>
                                            </>
                                        ) : (
                                            <span className="text-slate-500 italic">Unassigned</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-slate-400 text-xs mb-1">Issue ID</span>
                                    <span className="font-mono text-slate-600 text-xs">{issue.id}</span>
                                </div>

                                <div>
                                    <span className="block text-[#B0B3C0] text-xs mb-1">Last Updated</span>
                                    <span className="text-slate-300">{new Date(issue.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
