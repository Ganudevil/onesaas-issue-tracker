import { Navbar } from '@/components/Navbar';
import { IssueDetail } from '@/components/IssueDetail';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
                <IssueDetail id={id} />
            </div>
        </div>
    );
}
