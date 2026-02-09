'use client';

import { Bell, MoreVertical, Check, Trash2, X } from 'lucide-react';
import { NovuProvider, useNotifications, useRemoveNotification, useUnseenCount } from '@novu/notification-center';
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

const NotificationItem = ({ notification, markAsRead, removeNotification, onClose }: any) => {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
            onClose(); // Close drawer on navigation
        } else if (payload.url) {
            router.push(payload.url);
            onClose();
        }
    };

    const handleViewIssue = (e: any) => {
        e.stopPropagation();
        if (payload.issueId) {
            router.push(`/issues/${payload.issueId}`);
            if (isUnread && notificationId) markAsRead(notificationId);
            onClose();
        }
    };

    const handleMenuAction = (action: 'read' | 'remove', e: any) => {
        e.stopPropagation();
        if (!notificationId) return;

        if (action === 'read') {
            try {
                markAsRead(notificationId);
            } catch (err) {
                try { markAsRead({ messageId: notificationId }); } catch (e) { console.error(e); }
            }
        } else if (action === 'remove') {
            if (removeNotification) {
                try {
                    removeNotification({ messageId: notificationId });
                } catch (err) {
                    removeNotification(notificationId);
                }
            }
        }
        setShowMenu(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative mb-2 p-4 rounded-xl border transition-all duration-200
                ${isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}
                hover:shadow-md cursor-pointer w-full box-border
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
                                <div ref={menuRef} className="menu-content absolute right-0 top-6 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                                    <button onClick={(e) => handleMenuAction('read', e)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" /> Mark read
                                    </button>
                                    <button onClick={(e) => handleMenuAction('remove', e)} className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
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
                        <button onClick={handleViewIssue} className="action-btn px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:-translate-y-0.5">
                            View Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function CustomNotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Novu Hooks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { notifications: rawNotifications, isLoading, markAsRead, markAllAsRead, error } = useNotifications() as any;
    const notifications = rawNotifications || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: unseenCountData } = useUnseenCount() as any;
    const unseenCount = unseenCountData?.count ?? 0;

    const [showTimeoutError, setShowTimeoutError] = useState(false);

    useEffect(() => {
        if (error) {
            console.error("Novu notification error:", error);
        }
    }, [error]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading && !error) {
            setShowTimeoutError(false);
            timer = setTimeout(() => {
                setShowTimeoutError(true);
            }, 5000); // 5s timeout fallback
        }
        return () => clearTimeout(timer);
    }, [isLoading, error]);

    let removeNotification: any = null;
    try {
        const removeContext = useRemoveNotification();
        removeNotification = removeContext?.removeNotification;
    } catch (e) {
        console.error("Remove hook failed", e);
    }

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClearAll = async () => {
        if (!notifications || notifications.length === 0) return;
        if (!removeNotification) {
            markAllAsRead();
            return;
        }
        // Iterate and remove each notification
        const idsToRemove = notifications.map((n: any) => n._id || n.id);
        for (const id of idsToRemove) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await removeNotification({ messageId: id });
            } catch (err) {
                console.error(`Failed to remove notification ${id}`, err);
            }
        }
    };

    const hasUnread = (unseenCount || 0) > 0;

    return (
        <div className="relative">
            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer group p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                {hasUnread && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm">
                        {(unseenCount || 0) > 99 ? '99+' : unseenCount}
                    </span>
                )}
            </div>

            {/* Notification Drawer */}
            {isOpen && (
                <div
                    ref={containerRef}
                    className="absolute right-0 top-12 w-[380px] max-w-[90vw] h-[550px] bg-white shadow-2xl rounded-lg border border-gray-200 overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200"
                    style={{ maxHeight: 'calc(100vh - 100px)' }}
                >
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10 shrink-0">
                        <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => markAllAsRead()}
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

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-gray-50/50">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <p className="text-sm text-red-500 font-medium mb-2">Unavailable</p>
                                <p className="text-xs text-gray-500 mb-3">{error.message || "Failed to load notifications"}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (isLoading && !showTimeoutError) ? (
                            <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10 px-4">
                                <div className="bg-gray-50 p-4 rounded-full mb-4 relative">
                                    <Bell className="h-8 w-8 text-gray-400" />
                                    <span className="absolute top-2 right-3 text-xs font-bold text-gray-400">z</span>
                                    <span className="absolute top-1 right-1 text-[10px] font-bold text-gray-400">z</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">Nothing new to see here yet</p>
                                {showTimeoutError && (
                                    <p className="text-[10px] text-gray-400 mt-2">(Connection timed out - Live updates paused)</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {notifications.map((notification: any) => (
                                    <NotificationItem
                                        key={notification._id || notification.id}
                                        notification={notification}
                                        markAsRead={markAsRead}
                                        removeNotification={removeNotification}
                                        onClose={() => setIsOpen(false)}
                                    />
                                ))}
                                {showTimeoutError && (
                                    <p className="text-[10px] text-center text-gray-400 py-2">Offline mode</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-3 border-t border-gray-100 bg-white text-center shrink-0">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                            Powered By
                            <svg className="h-4 w-auto ml-1 opacity-80" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.66 2.05L8.7 6.42a1.5 1.5 0 01-2.48 0L3.25 2.05a1.5 1.5 0 00-2.49 1.66l5.05 7.57a3.5 3.5 0 005.8 0l5.05-7.57a1.5 1.5 0 00-2.49-1.66z" fill="#FF5252" />
                                <path d="M22 6c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4V6zm4 0v12h4V6h-4z" fill="#333" />
                            </svg>
                            <span className="font-bold text-pink-500">novu</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NovuInbox() {
    const authState = useAuthStore();
    const user = authState.user;
    // Default to the Production ID based on user screenshot
    const APP_ID = 'Wxa7z9RHue8E';
    const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID || APP_ID;
    const subscriberId = user?.id || user?.email || null;

    if (!subscriberId || !appId) return null;

    const backendUrl = process.env.NEXT_PUBLIC_NOVU_BACKEND_URL || 'https://api.novu.co';
    const socketUrl = process.env.NEXT_PUBLIC_NOVU_SOCKET_URL || 'wss://ws.novu.co';

    // Debug logging to help troubleshoot connection issues
    console.log('[NovuInbox] Config:', {
        appId,
        backendUrl,
        socketUrl,
        subscriberId,
        region: 'US (default)'
    });

    return (
        <NovuProvider
            subscriberId={subscriberId}
            applicationIdentifier={appId}
            backendUrl={backendUrl}
            socketUrl={socketUrl}
        >
            <CustomNotificationCenter />
        </NovuProvider>
    );
}
