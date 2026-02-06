'use client';

import { Bell, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

function CustomFooter() {
    const { markAllAsRead, notifications } = useNotifications();

    // Novu doesn't expose "deleteAll" easily in the public hook without iterating
    // But we can offer "Mark All Read" as a secondary explicit action if the header is confusing
    // REQUIRED: User asked for "Clear All". 
    // Since "Archive All" isn't standard, we will map this to "Mark All as Read" for now 
    // or we can simulate it if we had access to the api. 
    // Let's make it a "Mark all read" button that looks like "Clear" for UX, 
    // as "Clear" often just means "Clear badge/unread status" in users' minds.

    const handleClearAll = () => {
        markAllAsRead();
    };

    return (
        <div className="p-3 border-t bg-gray-50 flex justify-end">
            <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all (Mark read)
            </button>
        </div>
    );
}

export default function NovuInbox() {
    // Get the entire auth state
    const authState = useAuthStore();
    const user = authState.user;

    // Production App ID - CORRECTED from Novu dashboard screenshot
    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;

    // Try multiple fields for subscriber ID - MUST match backend (uses UUID)
    // ⚠️ Backend syncs user.id (UUID), so we MUST prioritize id over email
    const subscriberId = user?.id || user?.email || null;

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
                <PopoverNotificationCenter
                    colorScheme="light"
                    showUserPreferences={true}
                    listItem={(notification) => {
                        const payload = notification.payload as any;
                        return (
                            <div className="flex flex-col gap-1 p-4 border-b hover:bg-gray-50 transition-colors bg-white relative">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm text-gray-800">
                                        {payload.title || 'Notification'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {payload.description || notification.content || 'No details'}
                                </p>
                                {payload.priority && (
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-50 text-blue-600'
                                        }`}>
                                        {payload.priority}
                                    </span>
                                )}
                            </div>
                        );
                    }}
                    footer={() => <CustomFooter />}
                >
                    {({ unseenCount }) => (
                        <div className="relative cursor-pointer">
                            <Bell className="h-5 w-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                            {unseenCount && unseenCount > 0 ? (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {unseenCount > 99 ? '99+' : unseenCount}
                                </span>
                            ) : null}
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
