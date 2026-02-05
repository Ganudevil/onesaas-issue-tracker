
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (auth.isAuthenticated) {
            router.push('/issues');
        }
    }, [auth.isAuthenticated, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6 text-blue-600">Login to OneSAAS</h1>
                <p className="mb-4 text-gray-600">Secure access via Keycloak</p>
                <Button onClick={() => auth.signinRedirect()} className="w-full justify-center">
                    Sign In with SSO
                </Button>
            </div>
        </div>
    );
}
