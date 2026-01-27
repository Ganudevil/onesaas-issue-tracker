'use client';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { IssueForm } from '@/components/IssueForm';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function NewIssuePage() {
    const { role } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (role === 'viewer') {
            router.push('/issues');
        }
    }, [role, router]);

    if (role === 'viewer') return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <IssueForm />
            </div>
        </div>
    );
}
