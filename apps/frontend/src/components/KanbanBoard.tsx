'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IssueCard } from './IssueCard';
import { Issue, User, IssueStatus } from '../types';
import { db } from '../services/db';

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

        // Placeholder for future drag logic
    };

    // Group issues - Map API status to Columns
    // API: 'open', 'in_progress', 'closed'
    const todoIssues = issues.filter(i => i.status === IssueStatus.OPEN);
    const inProgressIssues = issues.filter(i => i.status === IssueStatus.IN_PROGRESS);
    const doneIssues = issues.filter(i => i.status === IssueStatus.CLOSED);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* To Do Column */}
                <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-3 md:mb-4 text-slate-100 text-base md:text-lg">To Do</h3>
                    <div className="space-y-3 md:space-y-4">
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
                    <h3 className="font-bold mb-3 md:mb-4 text-slate-100 text-base md:text-lg">In Progress</h3>
                    <div className="space-y-3 md:space-y-4">
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
                    <h3 className="font-bold mb-3 md:mb-4 text-slate-100 text-base md:text-lg">Done</h3>
                    <div className="space-y-3 md:space-y-4">
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
