'use client';
import { Navbar } from '@/components/Navbar';
import { IssueList } from '@/components/IssueList';
import { useRouter } from 'next/navigation';

export default function AssignedIssuesPage() {
    const router = useRouter();

    const handleNavigate = (page: string, id?: string) => {
        if (page === 'create') router.push('/issues/new');
        if (page === 'detail' && id) router.push(`/issues/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <IssueList onNavigate={handleNavigate} onlyMyIssues={true} />
            </div>
        </div>
    );
}
