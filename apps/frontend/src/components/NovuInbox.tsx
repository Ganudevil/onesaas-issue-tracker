'use client';

import { Bell } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

export default function NovuInbox() {
    const user = useAuthStore((state) => state.user);
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    // Simple null checks - if we don't have what we need, don't render
    if (!user?.email || !appId) {
        return null;
    }

    return (
        <NovuProvider
            subscriberId={user.email}
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
