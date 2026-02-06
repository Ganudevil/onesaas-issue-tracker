'use client';

import { Bell, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

function CustomHeader() {
    const { markAllAsRead } = useNotifications() as any;

    const handleClearAll = () => {
        markAllAsRead();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Mark all as read
                </button>
                <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                >
                    Clear all
                </button>
            </div>
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
                    header={() => <CustomHeader />}
                    listItem={(notification) => {
                        const payload = notification.payload as any;
                        return (
                            <div className="flex flex-col gap-1 p-4 hover:bg-gray-50 transition-colors bg-white relative border-b border-gray-100 last:border-0">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm text-gray-900">
                                        {payload.title || 'Notification'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {payload.description || notification.content || 'No details'}
                                </p>
                                {payload.priority && (
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-50 text-red-600' :
                                        'bg-blue-50 text-blue-600'
                                        }`}>
                                        {payload.priority}
                                    </span>
                                )}
                            </div>
                        );
                    }}
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
