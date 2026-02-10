import { Navbar } from '@/components/Navbar';
import { IssueDetail } from '@/components/IssueDetail';
import { Footer } from '@/components/Footer';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <div className="min-h-screen text-slate-100 flex flex-col">
            <Navbar />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 flex-grow w-full">
                <IssueDetail id={id} />
            </div>
            <Footer />
        </div>
    );
}
