'use client';

import {
    NovuProvider,
    useNotifications,
    useRemoveNotification,
    NotificationCenter
} from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

// Fallback Novu App ID - used if environment variable is not configured
const FALLBACK_NOVU_APP_ID = 'rPNktu-ZF0Xq';

export function NovuInbox() {
    const { user } = useAuthStore();
    // Use environment variable if available, otherwise use fallback
    // FORCE FALLBACK for now to ensure alignment with backend Development Key
    const appIdentifier = FALLBACK_NOVU_APP_ID; // process.env.NEXT_PUBLIC_NOVU_APP_ID || FALLBACK_NOVU_APP_ID;

    // Debug logging
    console.log('[NovuInbox] Debug:', {
        hasUser: !!user,
        userId: user?.id,
        appIdentifier,
        env: process.env.NEXT_PUBLIC_NOVU_APP_ID,
        usingFallback: !process.env.NEXT_PUBLIC_NOVU_APP_ID
    });

    // Don't render if no user is logged in
    if (!user) {
        return null;
    }

    // Always show Novu integration (with env var or fallback)
    return (
        <NovuProvider
            subscriberId={user.id}
            applicationIdentifier={appIdentifier}

        >
            <CustomInbox />
        </NovuProvider>
    );
}

// Placeholder component when Novu is not configured
function PlaceholderInbox() {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={popoverRef}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    zIndex: 9999,
                    width: '350px',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #edf2f7',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}>
                        Notifications
                    </div>
                    <div style={{
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: '#718096',
                        fontSize: '14px'
                    }}>
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p style={{ margin: 0 }}>Notifications not configured</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                            Set NEXT_PUBLIC_NOVU_APP_ID in environment variables
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Custom styles for the notification center
function CustomInbox() {
    const [isOpen, setIsOpen] = useState(false);
    const notificationsData = useNotifications();
    const { removeNotification: removeFn } = useRemoveNotification();
    const popoverRef = useRef<HTMLDivElement>(null);

    // Extract data from hook - useNotifications returns an object, not just the array
    const unseenCount = notificationsData?.unseenCount || 0;
    const notifications = notificationsData?.notifications || [];
    const markNotificationAsRead = notificationsData?.markNotificationAsRead;

    // Debug logging - check what data we're getting
    useEffect(() => {
        console.log('🔔 NOVU DEBUG:');
        console.log('  Full hook data:', notificationsData);
        console.log('  All hook keys:', Object.keys(notificationsData || {}));
        console.log('  unseenCount:', unseenCount);
        console.log('  notifications:', notifications);
        console.log('  isArray:', Array.isArray(notifications));
        console.log('  length:', notifications?.length);

        // Log all properties to find what we're missing
        if (notificationsData) {
            console.log('  Hook properties:');
            for (const key in notificationsData) {
                console.log(`    ${key}:`, notificationsData[key]);
            }
        }

        if (notifications && notifications.length > 0) {
            console.log('  first notification:', notifications[0]);
        } else {
            console.log('  ⚠️ Notifications array is empty but unseenCount is', unseenCount);
        }
    }, [notificationsData, unseenCount, notifications]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const togglePopover = () => {
        console.log('📣 Toggling popover, isOpen:', !isOpen);
        console.log('📣 Current notifications:', notifications);
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification: any) => {
        // Mark as read
        if (!notification.read) {
            await markNotificationAsRead(notification._id);
        }

        // Navigate to issue if available
        if (notification?.payload?.issueId) {
            setIsOpen(false);
            window.location.href = `/issues/${notification.payload.issueId}`;
        }
    };

    const handleDelete = (messageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFn({ messageId }, {
            onSuccess: () => {
                console.log('Notification removed successfully:', messageId);
            },
            onError: (error: any) => {
                console.error('Error removing notification:', error);
            }
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div style={{ position: 'relative' }} ref={popoverRef}>
            <div onClick={togglePopover} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                {unseenCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '10px',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unseenCount > 99 ? '99+' : unseenCount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    zIndex: 9999,
                    width: '100%',
                    maxWidth: '420px',
                    minWidth: '300px',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <InboxHeader />

                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {!notifications || notifications.length === 0 ? (
                            <div style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                color: '#718096',
                                fontSize: '13px'
                            }}>
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" style={{ margin: '0 auto 12px' }} />
                                <p style={{ margin: 0 }}>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification: any) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '12px 14px',
                                        borderBottom: '1px solid #f1f5f9',
                                        backgroundColor: notification.read ? '#ffffff' : '#f8fafc',
                                        borderLeft: notification.read ? 'none' : '3px solid #3b82f6',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = notification.read ? '#ffffff' : '#f8fafc';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: notification.read ? 400 : 600,
                                                color: '#1e293b',
                                                marginBottom: '4px',
                                                wordBreak: 'break-word'
                                            }}>
                                                {notification.content || 'New notification'}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#94a3b8'
                                            }}>
                                                {formatTime(notification.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(notification._id, e)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '20px',
                                                color: '#94a3b8',
                                                padding: '0',
                                                lineHeight: 1,
                                                flexShrink: 0,
                                                fontWeight: 'bold',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#94a3b8';
                                            }}
                                            title="Remove notification"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InboxHeader() {
    const { markAllNotificationsAsRead, removeAllMessages } = useNotifications();

    const handleClearAll = async () => {
        try {
            await removeAllMessages();
        } catch (err) {
            console.error('Error clearing:', err);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            zIndex: 20
        }}>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>
                Notifications
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={handleMarkAllRead}
                    style={{
                        fontSize: '12px',
                        color: '#64748b',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    type="button"
                >
                    Mark all read
                </button>
                <button
                    onClick={handleClearAll}
                    style={{
                        fontSize: '12px',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                    type="button"
                >
                    Clear all
                </button>
            </div>
        </div>
    );
}
