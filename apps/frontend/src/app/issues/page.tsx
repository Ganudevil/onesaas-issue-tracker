'use client';
import { Navbar } from '@/components/Navbar';
import { IssueList } from '@/components/IssueList';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export default function IssuesPage() {
    const { isAuthenticated, user, role } = useAuthStore();
    const router = useRouter();
    const [view, setView] = useState<'list' | 'board'>('board');

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4 text-slate-900">oneSAAS Issue Tracker</h1>
                    <p className="text-slate-600 mb-6">Please sign in to access your issues.</p>
                    <Button onClick={() => router.push('/login')} className="w-full justify-center">Sign In</Button>
                </div>
            </div>
        );
    }

    // Handle Navigation from IssueList which expects (page, id)
    const handleNavigate = (page: string, id?: string) => {
        if (page === 'detail' && id) router.push(`/issues/${id}`);
        if (page === 'create') router.push(`/issues/new`);
        if (page === 'list') router.push(`/issues`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">Issues</h1>
                    <div className="flex space-x-2">
                        {(!user || role !== 'viewer') && (
                            <Button onClick={() => router.push('/issues/new')} className="w-full sm:w-auto">New Issue</Button>
                        )}
                    </div>
                </div>

                {view === 'list' ? (
                    <IssueList onNavigate={handleNavigate} />
                ) : (
                    <KanbanBoard />
                )}
            </div>
        </div>
    );
}
