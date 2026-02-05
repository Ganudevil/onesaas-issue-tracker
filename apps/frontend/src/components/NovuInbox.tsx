'use client';

import { Bell } from 'lucide-react';

import * as NovuNotificationCenter from '@novu/notification-center';

// Universal import fallback to handle ESM/CJS interop differences on Vercel
const NovuProvider = NovuNotificationCenter.NovuProvider ||
    (NovuNotificationCenter as any).default?.NovuProvider;
const PopoverNotificationCenter = NovuNotificationCenter.PopoverNotificationCenter ||
    (NovuNotificationCenter as any).default?.PopoverNotificationCenter;

import { useAuthStore } from '../store/useAuthStore';

// START TELEMETRY
const DEPLOY_TIMESTAMP = '2026-02-05-17-30-FIX-v3';
console.log(`[NovuInbox] Init - Version: ${DEPLOY_TIMESTAMP}`);
// END TELEMETRY

export default function NovuInbox() {
    const userId = useAuthStore((state) => state.user?.email);
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    // Safety check for critical components to prevent React Error #130
    if (!NovuProvider || !PopoverNotificationCenter || !userId || !appId) {
        console.error('[NovuInbox] CRITICAL: Missing components or config', {
            hasNovuProvider: !!NovuProvider,
            hasPopover: !!PopoverNotificationCenter,
            hasUserId: !!userId,
            hasAppId: !!appId,
            novLibKeys: Object.keys(NovuNotificationCenter),
            timestamp: DEPLOY_TIMESTAMP
        });
        return null;
    }

    return (
        <NovuProvider
            subscriberId={userId}
            applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID || ''}
            backendUrl={process.env.NEXT_PUBLIC_NOVU_BACKEND_URL || 'https://api.novu.co'}
            socketUrl={process.env.NEXT_PUBLIC_NOVU_SOCKET_URL || 'https://ws.novu.co'}
        >
            <CustomInbox />
        </NovuProvider>
    );
}

function CustomInbox() {
    return (
        <PopoverNotificationCenter colorScheme="light">
            {({ unseenCount }) => (
                <div style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                    {(unseenCount || 0) > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            borderRadius: '50%',
                            fontSize: '10px',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {(unseenCount || 0) > 99 ? '99+' : unseenCount}
                        </span>
                    )}
                </div>
            )}
        </PopoverNotificationCenter>
    );
}
