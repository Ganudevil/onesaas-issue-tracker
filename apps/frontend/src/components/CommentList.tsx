'use client';
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { Comment, User } from '../types';
import { User as UserIcon, Trash2 } from 'lucide-react';

interface CommentListProps {
    issueId: string;
    refreshTrigger?: number;
}

export const CommentList: React.FC<CommentListProps> = ({ issueId, refreshTrigger }) => {
    const { user, token } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');
    const [users, setUsers] = useState<Record<string, User>>({});

    useEffect(() => {
        const fetchComments = async () => {
            if (!token) return;
            const data = await db.getCommentsByIssue(issueId, token);
            setComments(data);

            // Fetch authors
            const uIds = Array.from(new Set(data.map(c => c.createdBy)));
            const uMap: Record<string, User> = {};
            for (const uid of uIds) {
                if (!users[uid]) {
                    const u = await db.getUser(uid, token);
                    if (u) uMap[uid] = u;
                }
            }
            setUsers(prev => ({ ...prev, ...uMap }));
        };
        fetchComments();
    }, [issueId, refreshTrigger, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user || !token) return;

        await db.addComment({
            issueId,
            text,
            createdBy: user.id
        }, token);
        setText('');
        // Refresh locally
        const data = await db.getCommentsByIssue(issueId, token);
        setComments(data);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-medium text-black">Comments ({comments.length})</h3>

            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-3 group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-black">
                                    {users[comment.createdBy]?.displayName || 'Unknown'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                    {(user?.role === 'admin' || user?.id === comment.createdBy) && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Delete this comment?')) return;
                                                try {
                                                    await db.deleteComment(comment.id, token!);
                                                    setComments(prev => prev.filter(c => c.id !== comment.id));
                                                } catch (e) {
                                                    console.error('Failed to delete comment', e);
                                                    alert('Failed to delete comment');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-black whitespace-pre-wrap">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    className="flex-1 rounded-md border border-slate-300 p-2 text-black text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={!text.trim()}>
                    Post
                </Button>
            </form>
        </div>
    );
};
