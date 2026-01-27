'use client';
import { Navbar } from '@/components/Navbar';
import { IssueForm } from '@/components/IssueForm';
import { use } from 'react';

export default function EditIssuePage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <IssueForm issueId={id} />
            </div>
        </div>
    );
}
