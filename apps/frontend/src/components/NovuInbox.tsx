'use client';

import { Bell, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

function CustomHeader() {
    // Cast to any to bypass TS error for markAllAsRead if type definition is outdated
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
    const router = useRouter(); // Initialize router
    const user = authState.user;

    // Production App ID
    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;

    // Try multiple fields for subscriber ID - MUST match backend (uses UUID)
    // ⚠️ Backend syncs user.id (UUID), so we MUST prioritize id over email
    const subscriberId = user?.id || user?.email || null;

    if (!subscriberId || !appId) {
        // Fail silently or log in dev
        return null;
    }

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
                    // Check if unread (Novu typically uses 'seen' or 'read' - checking !read)
                    const isUnread = !notification.read;

                    const handleNotificationClick = () => {
                        // Navigate logic
                        if (payload.issueId) {
                            router.push(`/issues/${payload.issueId}`);
                        } else if (payload.url) {
                            router.push(payload.url);
                        }
                    };

                    return (
                        <div
                            onClick={handleNotificationClick}
                            className={`flex flex-col gap-1 p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors relative
                                ${isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-white hover:bg-gray-50'}
                            `}
                        >
                            {/* Unread Indicator Dot */}
                            {isUnread && (
                                <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                            )}

                            <div className="flex justify-between items-start pr-4">
                                <span className={`text-sm text-gray-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                                    {payload.title || 'Notification'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className={`text-xs line-clamp-2 leading-relaxed ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                {payload.description || notification.content || 'No details'}
                            </p>
                            {payload.priority && (
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit mt-1 ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-50 text-red-600' :
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
}
