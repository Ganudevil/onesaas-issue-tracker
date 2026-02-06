'use client';

import { Bell } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

export default function NovuInbox() {
    const user = useAuthStore((state) => state.user);
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    // Try multiple fields to get a subscriber ID
    const subscriberId = user?.email || user?.id;

    // Debug logging to see what we actually have
    console.log('[NovuInbox] Debug:', {
        hasUser: !!user,
        userEmail: user?.email,
        userId: user?.id,
        userName: user?.name,
        subscriberId: subscriberId,
        appId: appId
    });

    // If we don't have EITHER email OR id, don't render
    if (!subscriberId || !appId) {
        console.warn('[NovuInbox] Not rendering - missing subscriberId or appId');
        return null;
    }

    console.log('[NovuInbox] Rendering with subscriberId:', subscriberId);

    return (
        <NovuProvider
            subscriberId={subscriberId}
            applicationIdentifier={appId}
        >
            <PopoverNotificationCenter colorScheme="light">
                {({ unseenCount }) => (
                    <div className="relative cursor-pointer">
                        <Bell className="h-5 w-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                        {unseenCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {unseenCount > 99 ? '99+' : unseenCount}
                            </span>
                        )}
                    </div>
                )}
            </PopoverNotificationCenter>
        </NovuProvider>
    );
}
