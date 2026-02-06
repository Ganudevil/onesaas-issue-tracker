'use client';

import { Bell, MoreVertical, Check, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
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
const NotificationItem = ({ notification, markAsRead, removeNotification, archiveNotification }: any) => {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const payload = notification.payload || {};
    const isUnread = !notification.read;

    // Close menu when clicking outside
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
        if (e.target.closest('.menu-trigger') || e.target.closest('.menu-content')) return;

        if (payload.issueId) {
            router.push(`/issues/${payload.issueId}`);
            if (isUnread) markAsRead(notification._id);
        } else if (payload.url) {
            router.push(payload.url);
        }
    };

    const handleMenuAction = (action: 'read' | 'remove', e: any) => {
        e.stopPropagation();
        if (action === 'read') {
            markAsRead(notification._id);
        } else if (action === 'remove') {
            // Prioritize archiveNotification (Standard Inbox "Remove" behavior means Archive)
            // Fallback to removeNotification
            if (archiveNotification) {
                archiveNotification(notification._id);
            } else if (removeNotification) {
                removeNotification(notification._id);
            } else {
                console.error("NovuInbox: No archive/remove method available", { notificationId: notification._id });
            }
        }
        setShowMenu(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative mb-3 p-4 rounded-xl border transition-all duration-300 transform
                ${isUnread
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-100' // Read items are white
                }
                hover:scale-[1.02] hover:shadow-lg hover:z-10
                cursor-pointer
            `}
            style={{
                boxShadow: isUnread ? '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
        >
            <div className="relative z-1 flex justify-between items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        <h4 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {payload.title || 'Notification'}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium ml-auto">
                            {timeAgo(notification.createdAt)}
                        </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                        {payload.description || notification.content || 'No details'}
                    </p>

                    <div className="flex items-center gap-2">
                        {payload.priority && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${(payload.priority || '').toLowerCase() === 'high'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                {payload.priority}
                            </span>
                        )}
                    </div>
                </div>

                {/* 3 Dots Menu */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="menu-trigger p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="menu-content absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
                        >
                            <button
                                onClick={(e) => handleMenuAction('read', e)}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Check className="w-3 h-3" /> Mark read
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
        </div>
    );
};

function CustomHeader() {
    const { markAllAsRead, notifications, markAsRead } = useNotifications() as any;

    const handleMarkAllRead = () => {
        if (markAllAsRead) {
            markAllAsRead();
        } else if (notifications) {
            const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id);
            if (unreadIds.length > 0) markAsRead(unreadIds);
        }
    };

    const handleClearAll = () => {
        handleMarkAllRead();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
            <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
            <div className="flex gap-4">
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
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

// Wrapper to access context hook
function NotificationHelper({ notification }: { notification: any }) {
    // Destructure archiveNotification AND removeNotification
    const { markAsRead, removeNotification, archiveNotification } = useNotifications() as any;

    // Debug log just once in development to check methods
    useEffect(() => {
        // console.log("Novu Methods Available:", { hasRemove: !!removeNotification, hasArchive: !!archiveNotification });
    }, []);

    return (
        <NotificationItem
            notification={notification}
            markAsRead={markAsRead}
            removeNotification={removeNotification}
            archiveNotification={archiveNotification}
        />
    );
}
