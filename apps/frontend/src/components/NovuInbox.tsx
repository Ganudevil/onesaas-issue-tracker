'use client';

import {
    NovuProvider,
    useNotifications,
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
    const appIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID || FALLBACK_NOVU_APP_ID;

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
                    width: '420px', // Slightly wider for better text fit
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <InboxHeader />

                    <div style={{ maxHeight: '500px', overflowY: 'auto', position: 'relative' }}>
                        <style>{`
                            /* Hide the default Novu header */
                            .nc-header { display: none !important; }
                            
                            /* Custom overrides for notification items */
                            .nc-notifications-list-item {
                                padding: 16px !important;
                                border-bottom: 1px solid #f1f5f9 !important;
                            }
                            
                            /* Fix huge button sizes */
                            .nc-notifications-list-item button {
                                padding: 8px 16px !important;
                                font-size: 13px !important;
                                height: auto !important;
                                min-height: 32px !important;
                                width: auto !important;
                                display: inline-flex !important;
                                margin-top: 8px !important;
                            }
                            
                            /* Fix text sizes */
                            .mantine-Text-root {
                                font-size: 14px !important;
                                line-height: 1.5 !important;
                                color: #1e293b !important;
                            }
                        `}</style>
                        <NotificationCenter
                            colorScheme="light"
                            onNotificationClick={(notification: any) => {
                                if (notification?.payload?.issueId) {
                                    window.location.href = `/issues/${notification.payload.issueId}`;
                                }
                            }}
                            showUserPreferences={false}
                            header={() => <></>}
                            theme={{
                                light: {
                                    loaderColor: '#3b82f6',
                                    layout: {
                                        background: '#ffffff',
                                        color: '#1e293b',
                                    },
                                    notificationItem: {
                                        background: '#ffffff',
                                        color: '#1e293b',
                                        seen: {
                                            background: '#f8fafc',
                                            color: '#64748b',
                                        },
                                        unseen: {
                                            background: '#ffffff',
                                            color: '#1e293b',
                                            boxShadow: 'inset 4px 0 0 #3b82f6',
                                        }
                                    }
                                }
                            }}
                            styles={{
                                notificationItem: {
                                    container: {
                                        borderBottom: '1px solid #f1f5f9',
                                    }
                                }
                            }}
                        />
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
