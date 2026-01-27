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
        <Card className="hover:shadow-md transition-shadow cursor-pointer relative group">
            <div onClick={onClick}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle>
                            <span className="text-base font-medium text-black">{issue.title}</span>
                        </CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[issue.status] || ''}`}>
                            {STATUS_LABELS[issue.status] || issue.status}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-800 line-clamp-2 mb-4">
                        {issue.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {createdUser?.displayName || 'Unknown'}
                            </div>
                            {assignedUser && (
                                <div className="flex items-center text-blue-600">
                                    <span className="mr-1">→</span>
                                    {assignedUser.displayName}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
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
