'use client';

import { Bell, MoreVertical, Check, Trash2 } from 'lucide-react';
// Import separate hooks for actions if available
import { NovuProvider, PopoverNotificationCenter, useNotifications, useRemoveNotification } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// Helper for relative time
function timeAgo(date: string | Date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}

// Separate Item Component
const NotificationItem = ({ notification, markAsRead, removeNotification }: any) => {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Ensure we have an ID
    const notificationId = notification._id || notification.id;
    const payload = notification.payload || {};
    const isUnread = !notification.read;

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleClick = (e: any) => {
        if (e.target.closest('.menu-trigger') || e.target.closest('.menu-content') || e.target.closest('.action-btn')) return;

        if (payload.issueId) {
            router.push(`/issues/${payload.issueId}`);
            if (isUnread && notificationId) markAsRead(notificationId);
        } else if (payload.url) {
            router.push(payload.url);
        }
    };

    const handleViewIssue = (e: any) => {
        e.stopPropagation();
        if (payload.issueId) {
            router.push(`/issues/${payload.issueId}`);
            if (isUnread && notificationId) markAsRead(notificationId);
        }
    };

    const handleMenuAction = (action: 'read' | 'remove', e: any) => {
        e.stopPropagation();
        if (!notificationId) {
            console.error("NovuItem: Missing notification ID", notification);
            return;
        }

        if (action === 'read') {
            try {
                markAsRead(notificationId);
            } catch (err) {
                console.warn("Retrying markAsRead with object format...");
                // Try object format if string fails, though mostly string is correct for markAsRead
                try {
                    markAsRead({ messageId: notificationId });
                } catch (e) {
                    console.error("Failed to mark as read", e);
                }
            }
        } else if (action === 'remove') {
            if (removeNotification) {
                // IMPORTANT: useRemoveNotification hook often expects the messageId in an object OR as a string depending on version.
                // The error ".../messages/undefined" strongly suggests it accessed `arg.messageId` on a string.
                // So we try passing an object: { messageId: id }
                try {
                    removeNotification({ messageId: notificationId });
                } catch (err) {
                    // Fallback just in case
                    console.warn("Retrying remove with direct string...");
                    removeNotification(notificationId);
                }
            } else {
                console.error("Remove function not available");
            }
        }
        setShowMenu(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative mb-2 p-4 rounded-xl border transition-all duration-200
                ${isUnread
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-100'
                }
                hover:shadow-md
                cursor-pointer
                w-full box-border
            `}
            style={{
                boxShadow: isUnread ? '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
        >
            <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md ${isUnread ? 'bg-blue-500' : 'bg-transparent'}`} />

            <div className="relative z-1 flex justify-between items-start gap-3 pl-2">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                            {timeAgo(notification.createdAt)} ago
                        </span>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="menu-trigger p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {showMenu && (
                                <div
                                    ref={menuRef}
                                    className="menu-content absolute right-0 top-6 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
                                >
                                    <button
                                        onClick={(e) => handleMenuAction('read', e)}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Check className="w-3 h-3 text-green-500" /> Mark read
                                    </button>
                                    <button
                                        onClick={(e) => handleMenuAction('remove', e)}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h4 className={`text-sm mb-1 ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {payload.title || 'Notification'}
                    </h4>

                    <div className="text-xs text-gray-500 leading-normal mb-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-1 break-words whitespace-pre-wrap">
                        {payload.description || notification.content || 'No details'}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleViewIssue}
                            className="action-btn px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:-translate-y-0.5"
                        >
                            View Issue
                        </button>

                        {payload.priority && (
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${(payload.priority || '').toLowerCase() === 'high'
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                {payload.priority}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function CustomHeader() {
    const { markAllAsRead, notifications, markAsRead } = useNotifications() as any;

    // Get the remove function from the specific hook
    let removeNotification: any = null;
    try {
        const removeContext = useRemoveNotification();
        removeNotification = removeContext?.removeNotification;
    } catch (e) {
        console.error("CustomHeader: Failed to get remove context", e);
    }

    const handleMarkAllRead = () => {
        if (markAllAsRead) {
            markAllAsRead();
        } else if (notifications) {
            // Fallback: manually mark loaded ones
            const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id || n.id);
            if (unreadIds.length > 0) markAsRead(unreadIds);
        }
    };

    const handleClearAll = async () => {
        if (!notifications || notifications.length === 0) return;

        if (!removeNotification) {
            console.warn("Clear All: Remove function not available, falling back to Mark All Read");
            handleMarkAllRead();
            return;
        }

        // Iterate and remove each notification
        const idsToRemove = notifications.map((n: any) => n._id || n.id);

        // Limit to prevent browser issues if list is huge (Novu pages anyway)
        // We iterate and try to remove each.
        for (const id of idsToRemove) {
            try {
                // IMPORTANT: Pass object { messageId: id } as per fix
                await removeNotification({ messageId: id });
            } catch (err) {
                console.error(`Failed to remove notification ${id}`, err);
            }
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
            <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
            <div className="flex gap-4">
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                    Mark all read
                </button>
                <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md transition-colors"
                >
                    Clear all
                </button>
            </div>
        </div>
    );
}

export default function NovuInbox() {
    const authState = useAuthStore();
    const user = authState.user;
    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;
    const subscriberId = user?.id || user?.email || null;

    if (!subscriberId || !appId) return null;

    return (
        <NovuProvider subscriberId={subscriberId} applicationIdentifier={appId}>
            <DebugLogger />
            <PopoverNotificationCenter
                colorScheme="light"
                showUserPreferences={true}
                header={() => <CustomHeader />}
                listItem={(notification) => {
                    return <NotificationHelper notification={notification} />;
                }}
            >
                {({ unseenCount }) => (
                    <div className="relative cursor-pointer group">
                        <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Bell className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        {unseenCount && unseenCount > 0 ? (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm">
                                {unseenCount > 99 ? '99+' : unseenCount}
                            </span>
                        ) : null}
                    </div>
                )}
            </PopoverNotificationCenter>
        </NovuProvider>
    );
}

// Wrapper to access context hooks correctly
function NotificationHelper({ notification }: { notification: any }) {
    // Use the standard hook for basic actions
    const { markAsRead } = useNotifications() as any;

    // Try to use the specific remove hook
    let removeNotification: any = null;
    try {
        const removeContext = useRemoveNotification();
        removeNotification = removeContext?.removeNotification;
    } catch (err) {
        console.error("NovuInbox: Remove hook failed", err);
    }

    return (
        <NotificationItem
            notification={notification}
            markAsRead={markAsRead}
            removeNotification={removeNotification}
        />
    );
}

function DebugLogger() {
    const { user } = useAuthStore();
    const { notifications } = useNotifications();
    useEffect(() => {
        // Log subscriber info for debugging
        if (user) console.log("Novu Debug - SubscriberID:", user.id || user.email);
        console.log("Novu Debug - Notification Count:", notifications?.length);
    }, [user, notifications]);
    return null;
}
