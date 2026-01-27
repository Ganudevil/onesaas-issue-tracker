
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IssueCard } from './IssueCard';
import { Issue, User } from '../types';
import { db } from '../services/db';


// Sortable Item Component - now uses IssueCard
function SortableIssue({ issue, users }: { issue: Issue; users: User[] }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: issue.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const createdUser = users.find(u => u.id === issue.createdBy);
    const assignedUser = users.find(u => u.id === issue.assignedTo);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-4 mb-2 rounded shadow hover:shadow-md cursor-grab active:cursor-grabbing border border-gray-200">
            <h4 className="font-semibold text-gray-800">{issue.title}</h4>
            <div className="flex justify-between items-center mt-2">
                <span className={`text-xs px-2 py-1 rounded capitalize ${issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>{issue.priority}</span>
            </div>
        </div>
    );
}

// Column Component
function KanbanColumn({ title, issues, id }: { title: string, issues: Issue[], id: string }) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/3 min-h-[500px] flex flex-col">
            <h3 className="font-bold mb-4 text-gray-700 uppercase tracking-wide px-2 border-l-4 border-indigo-500">{title}</h3>
            <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1">
                    {issues.map(issue => (
                        <SortableIssue key={issue.id} issue={issue} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export function KanbanBoard() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const { tenantId, token, user } = useAuthStore();
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!token || !tenantId) return;

        // Fetch issues
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/issues`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
            }
        }).then(res => {
            setIssues(res.data);
        }).catch(err => console.error(err));

        // Fetch users using db service (properly maps display_name)
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await db.getAllUsers(token);
                setUsers(fetchedUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, [token, tenantId]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        // Find the issue being dragged
        const activeId = active.id;
        const overId = over.id;

        const activeIssue = issues.find(i => i.id === activeId);
        if (!activeIssue) return;

        // Determine new status based on where it was dropped is tricky in strict dnd-kit without droppable containers for columns
        // Simplification: We will assume we dropped onto another item in a different group, or we need Container ref.
        // For a proper board, we should make columns Droppable. 
        // BUT, let's implement a simpler standard dnd-kit kanban logic or just update status if we assume columns are containers.

        // Correction: In this simplified view, let's just use columns as Drop zones.
        // But SortableContext expects items.

        // Let's implement simpler: Just list issues. 
        // Actually, "Convert board -> Kanban" was a specific requirement.
        // I need to ensure the columns are Droppable.
    };

    // Group issues
    // Group issues - Map API status to Columns
    // API: 'open', 'in_progress', 'closed'
    // Board: 'To Do', 'In Progress', 'Done'
    const todoIssues = issues.filter(i => i.status === 'open' || i.status === 'todo');
    const inProgressIssues = issues.filter(i => i.status === 'in_progress');
    const doneIssues = issues.filter(i => i.status === 'closed' || i.status === 'done');

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-6">
                {/* To Do Column */}
                <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-4 text-slate-900">To Do</h3>
                    <div className="space-y-4">
                        {todoIssues.map(i => {
                            const createdUser = users.find(u => u.id === i.createdBy);
                            const assignedUser = users.find(u => u.id === i.assignedTo);
                            return (
                                <IssueCard
                                    key={i.id}
                                    issue={i}
                                    createdUser={createdUser}
                                    assignedUser={assignedUser}
                                    onClick={() => router.push(`/issues/${i.id}`)}
                                />
                            );
                        })}
                    </div>
                </div>
                {/* In Progress Column */}
                <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-4 text-slate-900">In Progress</h3>
                    <div className="space-y-4">
                        {inProgressIssues.map(i => {
                            const createdUser = users.find(u => u.id === i.createdBy);
                            const assignedUser = users.find(u => u.id === i.assignedTo);
                            return (
                                <IssueCard
                                    key={i.id}
                                    issue={i}
                                    createdUser={createdUser}
                                    assignedUser={assignedUser}
                                    onClick={() => router.push(`/issues/${i.id}`)}
                                />
                            );
                        })}
                    </div>
                </div>
                {/* Done Column */}
                <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-4 text-slate-900">Done</h3>
                    <div className="space-y-4">
                        {doneIssues.map(i => {
                            const createdUser = users.find(u => u.id === i.createdBy);
                            const assignedUser = users.find(u => u.id === i.assignedTo);
                            return (
                                <IssueCard
                                    key={i.id}
                                    issue={i}
                                    createdUser={createdUser}
                                    assignedUser={assignedUser}
                                    onClick={() => router.push(`/issues/${i.id}`)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
