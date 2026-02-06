'use client';

import { Bell, MoreVertical, Check, Trash2, X } from 'lucide-react';
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

// Separate Item Component to manage Menu State
const NotificationItem = ({ notification, markAsRead, removeNotification }: any) => {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Typecast payload safely
    const payload = notification.payload || {};
    const isUnread = !notification.read;

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: any) {
            // If menu is open and click is outside menu and outside the toggle button
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleClick = (e: any) => {
        // Prevent navigation if clicking menu
        if (e.target.closest('.menu-trigger') || e.target.closest('.menu-content')) return;

        if (payload.issueId) {
            router.push(`/issues/${payload.issueId}`);
            // Optional: Mark read on click
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
            // Check if removeNotification is available (it should be in standard Hook)
            // If not, we might fail silently or log.
            if (removeNotification) removeNotification(notification._id);
        }
        setShowMenu(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative mb-3 p-4 rounded-xl border transition-all duration-300 transform
                ${isUnread
                    ? 'bg-blue-50/80 border-blue-100 backdrop-blur-md'
                    : 'bg-white/90 border-gray-100 backdrop-blur-md'
                }
                hover:scale-[1.02] hover:shadow-lg hover:bg-white hover:z-10
                cursor-pointer
            `}
            style={{
                boxShadow: isUnread ? '0 4px 15px -3px rgba(59, 130, 246, 0.1)' : 'none'
            }}
        >
            {/* Glass Shine Effect on Hover */}
            <div className="absolute inset-0 rounded-xl bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-1 flex justify-between items-start gap-3">
                {/* Content */}
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

    const handleClearAll = () => {
        if (markAllAsRead) {
            markAllAsRead();
        } else if (notifications) {
            const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n._id);
            if (unreadIds.length > 0) markAsRead(unreadIds);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
            <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
            <div className="flex gap-3">
                <button onClick={handleClearAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Mark all read
                </button>
            </div>
        </div>
    );
}

export default function NovuInbox() {
    const authState = useAuthStore();
    const user = authState.user;
    const APP_ID = 'Wxa7z9RHue8E'; // Ensure this key is correct
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
                    // We need access to the hook actions here.
                    // Since we are inside the Provider, we can use the hook, BUT 'listItem' is a render prop.
                    // The cleanest way is to pass the data to our isolated component which uses the hook internally or we pass it if exposed.
                    // 'listItem' signature in Novu: (notification, handleNotificationClick, ...)
                    // Actually, let's use a wrapper component that calls useNotifications() to get the actions
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

// Wrapper to access context hook for each item
function NotificationHelper({ notification }: { notification: any }) {
    const { markAsRead, removeNotification } = useNotifications() as any;
    return (
        <NotificationItem
            notification={notification}
            markAsRead={markAsRead}
            removeNotification={removeNotification} // Pass remove action
        />
    );
}
