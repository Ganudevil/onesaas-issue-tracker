'use client';

import { Bell, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

// Helper for relative time (e.g. "5 minutes ago")
function timeAgo(date: string | Date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function CustomHeader() {
    // Robust Clear All Implementation: Get notifications and mark unread ones properly
    const { markAsRead, notifications } = useNotifications() as any;

    const handleClearAll = () => {
        if (!notifications) return;
        // Filter unread and mark them
        // Note: notifications might be paginated, this handles loaded ones.
        // For simpler UX, we try to mark all visible ones.
        const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id);
        if (unreadIds.length > 0) {
            markAsRead(unreadIds);
        }
    };

    // Also "Mark all read" link should use the same robust logic or the global function if reliable
    const handleMarkAllRead = () => {
        const unreadIds = notifications?.filter((n: any) => !n.read).map((n: any) => n._id) || [];
        if (unreadIds.length > 0) {
            markAsRead(unreadIds);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 className="font-bold text-lg text-gray-900">Notifications</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleMarkAllRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Mark all read
                </button>
                <button
                    onClick={handleClearAll}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
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
                    // Check if unread (Novu uses 'read' boolean)
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
                            className={`flex flex-col gap-1 p-4 border-b border-gray-200 last:border-0 cursor-pointer transition-colors relative
                                ${isUnread ? 'bg-blue-50/60' : 'bg-white'} 
                                hover:bg-gray-50
                            `}
                        >
                            {/* Unread Indicator: Blue vertical bar on left + dot */}
                            {isUnread && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className={`text-sm text-gray-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                                    {payload.title || 'Notification'}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                {payload.description || notification.content || 'No details'}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {timeAgo(notification.createdAt)}
                                </span>
                                {payload.priority && (
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0 rounded ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                        }`}>
                                        {payload.priority}
                                    </span>
                                )}
                            </div>
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
