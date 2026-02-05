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
    const { unseenCount } = useNotifications();
    const removeNotificationMutation = useRemoveNotification();
    const popoverRef = useRef<HTMLDivElement>(null);

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

    const togglePopover = () => setIsOpen(!isOpen);

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
                    <CustomNotificationList removeNotificationMutation={removeNotificationMutation} />
                </div>
            )}
        </div>
    );
}

// Custom Notification List Component
function CustomNotificationList({ removeNotificationMutation }: { removeNotificationMutation: any }) {
    const { notifications, markNotificationAsRead, fetchMore } = useNotifications();
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    const handleRemove = async (messageId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic UI update - hide the notification immediately
        setRemovingIds(prev => new Set(prev).add(messageId));

        try {
            // Call the mutation with the correct object structure
            await removeNotificationMutation.mutateAsync({ messageId });
            console.log('Notification removed successfully:', messageId);

            // Force refetch to update the list
            setTimeout(() => {
                fetchMore();
            }, 100);
        } catch (error) {
            console.error('Error removing notification:', error);
            // Remove from removing set if error occurs
            setRemovingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(messageId);
                return newSet;
            });
        }
    };

    const handleClick = async (notification: any) => {
        if (!notification.read) {
            await markNotificationAsRead(notification._id);
        }
        if (notification?.payload?.issueId) {
            window.location.href = `/issues/${notification.payload.issueId}`;
        }
    };

    const formatTime = (date: string) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (!notifications || notifications.length === 0) {
        return (
            <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#718096',
                fontSize: '13px'
            }}>
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0 }}>No notifications</p>
            </div>
        );
    }

    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {notifications
                .filter((notification: any) => !removingIds.has(notification._id))
                .map((notification: any) => (
                    <div
                        key={notification._id}
                        onClick={() => handleClick(notification)}
                        style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: notification.read ? '#ffffff' : '#f8fafc',
                            borderLeft: notification.read ? 'none' : '3px solid #3b82f6',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#ffffff' : '#f8fafc'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1, paddingRight: '8px' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: notification.read ? 400 : 600,
                                    color: '#1e293b',
                                    marginBottom: '4px'
                                }}>
                                    {notification.content || 'Notification'}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#94a3b8'
                                }}>
                                    {formatTime(notification.createdAt)}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleRemove(notification._id, e)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: '#94a3b8',
                                    fontSize: '18px',
                                    lineHeight: 1,
                                    flexShrink: 0,
                                    fontWeight: 'bold'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#e53e3e'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                title="Remove notification"
                            >
                                ×
                            </button>
                        </div>
                        {notification?.cta?.action?.buttons?.length > 0 && (
                            <button
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 12px',
                                    backgroundColor: '#e53e3e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }}
                            >
                                View Issue
                            </button>
                        )}
                    </div>
                ))}
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
