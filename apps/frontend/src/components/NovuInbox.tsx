'use client';

import { Bell } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

export default function NovuInbox() {
    // Get the entire auth state
    const authState = useAuthStore();
    const user = authState.user;

    // Production App ID - CORRECTED from Novu dashboard screenshot
    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;

    // Try multiple fields for subscriber ID
    const subscriberId = user?.email || user?.id || null;

    // Extensive debug logging
    console.group('[NovuInbox] Component Render');
    console.log('Full Auth State:', authState);
    console.log('User Object:', user);
    console.log('User Email:', user?.email);
    console.log('User ID:', user?.id);
    console.log('User Name:', user?.name);
    console.log('Subscriber ID (selected):', subscriberId);
    console.log('App ID from env:', process.env.NEXT_PUBLIC_NOVU_APP_ID);
    console.log('App ID (final):', appId);
    console.groupEnd();

    // Explicit check with clear logging
    if (!subscriberId) {
        console.error('[NovuInbox] ❌ NO SUBSCRIBER ID - Cannot render');
        console.log('[NovuInbox] User object was:', user);
        return null;
    }

    if (!appId) {
        console.error('[NovuInbox] ❌ NO APP ID - Cannot render');
        return null;
    }

    console.log('[NovuInbox] ✅ Rendering Novu Bell with:', {
        subscriberId,
        appId
    });

    try {
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
    } catch (error) {
        console.error('[NovuInbox] ❌ Error rendering:', error);
        return null;
    }
}
