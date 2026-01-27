'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { Issue, IssueStatus, UserRole, User } from '../types';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IssueFormProps {
    issueId?: string; // If present, it's edit mode
}

export const IssueForm: React.FC<IssueFormProps> = ({ issueId }) => {
    const { user, token, role } = useAuthStore();
    const router = useRouter(); // Use Next.js router
    const [formData, setFormData] = useState<Partial<Issue>>({
        title: '',
        description: '',
        status: IssueStatus.OPEN,
        assignedTo: null
    });
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const isEdit = !!issueId;

    useEffect(() => {
        const init = async () => {
            if (!token) return;
            const u = await db.getAllUsers(token);
            setUsers(u);

            if (isEdit && issueId) {
                const existing = await db.getIssueById(issueId, token);
                if (existing) {
                    setFormData(existing);
                }
            }
        };
        init();
    }, [isEdit, issueId, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !user || !token) return;
        setLoading(true);

        try {
            if (isEdit && issueId) {
                // Strip read-only fields
                const { id, createdBy, createdAt, updatedAt, ...updateData } = formData as Issue;
                await db.updateIssue(issueId, updateData, token);
                router.push(`/issues/${issueId}`);
            } else {
                const created = await db.createIssue({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status || IssueStatus.OPEN,
                    assignedTo: formData.assignedTo || null,
                    createdBy: user.id
                }, token);
                router.push(`/issues/${created.id}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Operation failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // RBAC for assignment
    const canAssign = role === 'admin';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div>
                <h1 className="text-2xl font-bold text-black">{isEdit ? 'Edit Issue' : 'Create New Issue'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-md border border-slate-300 p-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        maxLength={120}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full rounded-md border border-slate-300 p-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-black">Status</label>
                        <select
                            className="w-full rounded-md border border-slate-300 p-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                        >
                            <option value={IssueStatus.OPEN}>Open</option>
                            <option value={IssueStatus.IN_PROGRESS}>In Progress</option>
                            <option value={IssueStatus.CLOSED}>Closed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-black">Assigned To</label>
                        <select
                            disabled={!canAssign}
                            className="w-full rounded-md border border-slate-300 p-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                            value={formData.assignedTo || ''}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value || null })}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.displayName || u.email || 'Unknown User'} ({u.role})
                                </option>
                            ))}
                        </select>
                        {!canAssign && <p className="text-xs text-slate-400">Only Admins can assign users.</p>}
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" className="text-red-500 border-red-200 hover:bg-red-50" onClick={async () => {
                        if (!token) return;
                        try {
                            setLoading(true);
                            await db.fixSchema(token);
                            alert('System repaired! Please try creating the issue again.');
                        } catch (e: any) {
                            alert(`Repair failed: ${e.message}`);
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        Repair System
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => router.push('/issues')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Issue')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
