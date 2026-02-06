'use client';

import { Bell } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';

// START TELEMETRY
const DEPLOY_TIMESTAMP = '2026-02-06-NOVU-FIX-V2';
console.log(`[NovuInbox] Init - Version: ${DEPLOY_TIMESTAMP}`);
// END TELEMETRY

export default function NovuInbox() {
    const user = useAuthStore((state) => state.user);
    const [isReady, setIsReady] = useState(false);

    // Get subscriberId from email or fallback to id
    const subscriberId = user?.email || user?.id;
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    // Debug logging
    useEffect(() => {
        console.log('[NovuInbox] State Check:', {
            hasUser: !!user,
            userEmail: user?.email,
            userId: user?.id,
            subscriberId: subscriberId,
            appId: appId,
            hasAppId: !!appId,
            timestamp: DEPLOY_TIMESTAMP
        });

        // Only set ready when we have both values
        if (subscriberId && appId) {
            console.log('[NovuInbox] ✅ Ready to render with:', { subscriberId, appId });
            setIsReady(true);
        } else {
            console.warn('[NovuInbox] ⏳ Waiting for config:', {
                missingSubscriberId: !subscriberId,
                missingAppId: !appId
            });
            setIsReady(false);
        }
    }, [user, subscriberId, appId]);

    // Wait for authentication
    if (!isReady || !subscriberId || !appId) {
        console.log('[NovuInbox] Not rendering - missing:', {
            subscriberId: !!subscriberId,
            appId: !!appId,
            isReady
        });
        return null;
    }

    console.log('[NovuInbox] Rendering with subscriberId:', subscriberId);

    return (
        <NovuProvider
            subscriberId={subscriberId}
            applicationIdentifier={appId}
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
