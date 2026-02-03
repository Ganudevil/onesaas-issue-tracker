import React from 'react';
import { Issue, User as UserType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Calendar, User } from 'lucide-react';

interface IssueCardProps {
    issue: Issue;
    createdUser?: UserType;
    assignedUser?: UserType;
    onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps & { onDelete?: (id: string) => void }> = ({ issue, createdUser, assignedUser, onClick, onDelete }) => {
    return (
        <Card className="bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-md text-[var(--text-primary)] shadow-lg hover:bg-[var(--bg-card-hover)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-[var(--border-active)] transition-all duration-300 cursor-pointer relative group">
            <div onClick={onClick}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle>
                            <span className="text-base font-medium text-slate-100 group-hover:text-cyan-400 transition-colors">{issue.title}</span>
                        </CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[issue.status] || ''}`}>
                            {STATUS_LABELS[issue.status] || issue.status}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3 sm:mb-4">
                        {issue.description}
                    </p>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                            <div className="flex items-center">
                                <CardDescription className="flex items-center text-[var(--text-muted)] mt-1">
                                    Created by <span className="font-semibold text-[var(--text-secondary)] mx-1 truncate max-w-[80px] sm:max-w-none">{createdUser?.displayName || 'Unknown'}</span>
                                </CardDescription>
                            </div>
                            {assignedUser && (
                                <div className="flex items-center">
                                    <span className="text-xs text-[var(--text-muted)]">Assigned to</span>
                                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] ml-1">{assignedUser.displayName}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </CardContent>
            </div>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(issue.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Issue"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
            )}
        </Card>
    );
};
