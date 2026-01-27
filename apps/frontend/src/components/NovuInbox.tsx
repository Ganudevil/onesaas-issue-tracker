'use client';

import {
    NovuProvider,
    useNotifications,
    NotificationCenter
} from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

export function NovuInbox() {
    const { user } = useAuthStore();
    const appIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    if (user) {
        console.log('[NovuInbox] Initializing with:', { subscriberId: user.id, appIdentifier });
    }

    if (!user || !appIdentifier) {
        if (!appIdentifier) console.warn('[NovuInbox] Missing NEXT_PUBLIC_NOVU_APP_ID');
        return null;
    }

    return (
        <NovuProvider
            subscriberId={user.id}
            applicationIdentifier={appIdentifier}
            initialFetchedNotifications={[]}
        >
            <CustomInbox />
        </NovuProvider>
    );
}

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
                    width: '400px',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <InboxHeader />

                    {/* Container for NotificationCenter with CSS override to hide default header */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto', position: 'relative' }}>
                        <style>{`
                            /* Hide the default Novu header */
                            .nc-header { display: none !important; }
                        `}</style>
                        <NotificationCenter
                            colorScheme="light"
                            onNotificationClick={(notification: any) => {
                                if (notification?.payload?.issueId) {
                                    window.location.href = `/issues/${notification.payload.issueId}`;
                                }
                            }}
                            showUserPreferences={false}
                            header={() => null}
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
        console.log('Using removeAllMessages via custom header');
        try {
            await markAllNotificationsAsRead();
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
            padding: '16px',
            borderBottom: '1px solid #edf2f7',
            backgroundColor: 'white',
            zIndex: 20
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Notifications</span>
                <button
                    onClick={handleClearAll}
                    style={{
                        fontSize: '11px',
                        color: 'white',
                        background: '#e53e3e',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    title="Clear all notifications"
                    type="button"
                >
                    Clear All
                </button>
            </div>

            <button
                onClick={handleMarkAllRead}
                style={{
                    fontSize: '12px',
                    color: '#718096',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}
                type="button"
            >
                Mark all as read
            </button>
        </div>
    );
}
