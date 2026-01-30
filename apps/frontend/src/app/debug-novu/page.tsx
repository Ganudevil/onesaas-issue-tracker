'use client';

import { useAuthStore } from '../../store/useAuthStore';
import { NovuProvider, useNotifications } from '@novu/notification-center';
import { useState, useEffect } from 'react';

// Fallback from NovuInbox
const FALLBACK_NOVU_APP_ID = 'rPNktu-ZF0Xq';

export default function DebugNovuPage() {
    const { user, isAuthenticated } = useAuthStore();
    const envAppId = process.env.NEXT_PUBLIC_NOVU_APP_ID;
    const appId = envAppId || FALLBACK_NOVU_APP_ID;

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🔔 Novu Debugger</h1>

            <div className="grid gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">1. Environment & Config</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">NEXT_PUBLIC_NOVU_APP_ID:</span>
                            <span className={envAppId ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                {envAppId || '(Missing - Using Fallback)'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Active App ID:</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">{appId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Expected App ID:</span>
                            <span className="text-gray-400">rPNktu-ZF0Xq</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">2. User Context</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Is Authenticated:</span>
                            <span className={isAuthenticated ? "text-green-600" : "text-red-500"}>
                                {isAuthenticated ? 'YES' : 'NO'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">User Object:</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                                {user ? 'Present' : 'NULL'}
                            </span>
                        </div>
                        <div className="flex flex-col mt-2">
                            <span className="text-gray-500 mb-1">Subscriber ID (user.id):</span>
                            <div className="bg-slate-100 p-3 rounded break-all border border-slate-300">
                                {user?.id || 'MISSING USER ID'}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                This ID MUST match the ID used by the backend when triggering notifications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">3. Connection Test</h2>
                    {user ? (
                        <NovuProvider
                            subscriberId={user.id}
                            applicationIdentifier={appId}
                        >
                            <ConnectionTester />
                        </NovuProvider>
                    ) : (
                        <div className="text-red-500">Please login to test connection</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ConnectionTester() {
    const { notifications, isLoading, isError, error } = useNotifications();
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        if (isLoading) setStatus('Loading...');
        else if (isError) setStatus('Error');
        else setStatus('Connected');
    }, [isLoading, isError]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className={`
                    px-4 py-2 rounded-full font-bold
                    ${isLoading ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${isError ? 'bg-red-100 text-red-700' : ''}
                    ${!isLoading && !isError ? 'bg-green-100 text-green-700' : ''}
                `}>
                    Status: {status}
                </div>
            </div>

            {isLoading && (
                <div className="text-gray-500 animate-pulse">
                    Connecting to Novu socket... (If this takes > 10s, connection is blocked or ID is invalid)
                </div>
            )}

            {isError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
                    <p className="font-bold">Connection Failed!</p>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {!isLoading && !isError && (
                <div className="space-y-2">
                    <div className="text-green-600 font-bold">✅ Novu is Connected!</div>
                    <div className="text-sm text-gray-600">
                        Fetched {notifications?.length || 0} notifications for this subscriber.
                    </div>
                </div>
            )}
        </div>
    );
}
