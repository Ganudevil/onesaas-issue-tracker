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
    // Robust Access: Cast to any to ensure we get the methods even if types are loose
    const { markAsRead, notifications, markAllAsRead } = useNotifications() as any;

    const handleClearAll = () => {
        // "Clear All" Implementation
        // Strategy 1: markAllAsRead() - The global function
        if (markAllAsRead) {
            markAllAsRead();
            return;
        }

        // Strategy 2: Manual Iteration (Fallback)
        if (notifications && notifications.length > 0) {
            const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id);
            if (unreadIds.length > 0) {
                markAsRead(unreadIds);
            }
        }
    };

    // "Mark all read" - Same logic
    const handleMarkAllRead = () => {
        if (markAllAsRead) {
            markAllAsRead();
        } else if (notifications) {
            const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id);
            if (unreadIds.length > 0) markAsRead(unreadIds);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm z-10 relative">
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
    const authState = useAuthStore();
    const router = useRouter();
    const user = authState.user;

    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;

    // Use ID directly. Ensure this matches what backend sends (UUID)
    const subscriberId = user?.id || user?.email || null;

    // Debug Log
    if (subscriberId) {
        console.log('[NovuInbox] Subscriber Connected:', subscriberId);
    }

    if (!subscriberId || !appId) {
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
                    const isUnread = !notification.read;

                    const handleNotificationClick = () => {
                        // Mark read on click not explicitly needed if navigation happens, 
                        // but good for UX. The standard item usually handles it.
                        // We rely on user "Clear All" or "Mark Read" for bulk.
                        if (payload.issueId) {
                            router.push(`/issues/${payload.issueId}`);
                        } else if (payload.url) {
                            router.push(payload.url);
                        }
                    };

                    return (
                        <div
                            onClick={handleNotificationClick}
                            className={`
                                flex flex-col gap-1 p-4 border-b border-gray-200 last:border-0 cursor-pointer 
                                transition-all duration-200 ease-in-out relative
                                ${isUnread ? 'bg-blue-50/60' : 'bg-white'} 
                                hover:bg-white hover:scale-[1.02] hover:shadow-lg hover:z-20 hover:border-transparent
                                origin-center transform
                            `}
                        >
                            {/* Unread Indicator: Blue vertical bar */}
                            {isUnread && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l"></div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className={`text-sm text-gray-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                                    {payload.title || 'Notification'}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                                {payload.description || notification.content || 'No details'}
                            </p>

                            <div className="flex items-center gap-2 mt-3 justify-between">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {payload.priority || 'NORMAL'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {timeAgo(notification.createdAt)}
                                </span>
                            </div>
                        </div>
                    );
                }}
            >
                {({ unseenCount }) => (
                    <div className="relative cursor-pointer group">
                        <Bell className="h-5 w-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                        {unseenCount && unseenCount > 0 ? (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                {unseenCount > 99 ? '99+' : unseenCount}
                            </span>
                        ) : null}
                    </div>
                )}
            </PopoverNotificationCenter>
        </NovuProvider>
    );
}
