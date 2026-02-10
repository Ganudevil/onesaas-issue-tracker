import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

// ... existing imports

export default function IssuesPage() {
    // ... existing code ...

    return (
        <div className="min-h-screen text-slate-100 flex flex-col">
            <Navbar />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 flex-grow w-full">
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
            <Footer />
        </div>
    );
}
