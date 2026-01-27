
'use client';

import {
    NovuProvider,
    PopoverNotificationCenter,
    NotificationBell,
} from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

export function NovuInbox() {
    const { user } = useAuthStore();
    const router = useRouter();
    const appIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    if (user) {
        console.log('[NovuInbox] Initializing with:', { subscriberId: user.id, appIdentifier });
    }

    if (!user || !appIdentifier) {
        if (!appIdentifier) console.warn('[NovuInbox] Missing NEXT_PUBLIC_NOVU_APP_ID');
        return null;
    }

    const handleNotificationClick = (notification: any) => {
        console.log('[NovuInbox] Notification clicked:', notification);

        // Extract issueId from notification payload
        const issueId = notification?.payload?.issueId;

        if (issueId) {
            console.log('[NovuInbox] Redirecting to issue:', issueId);
            router.push(`/issues/${issueId}`);
        } else {
            console.warn('[NovuInbox] No issueId found in notification payload');
        }
    };

    return (
        <NovuProvider
            subscriberId={user.id}
            applicationIdentifier={appIdentifier}
            initialFetchedNotifications={[]}
        >
            <PopoverNotificationCenter
                colorScheme="light"
                onNotificationClick={handleNotificationClick}
            >
                {({ unseenCount }) => (
                    <div>
                        <NotificationBell unseenCount={unseenCount} />
                    </div>
                )}
            </PopoverNotificationCenter>
        </NovuProvider>
    );
}
