'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import MockNotificationService from '../services/mockNotificationService';
import { useRouter } from 'next/navigation';

export function MockNotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const popoverRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Load notifications on mount and listen for updates
    useEffect(() => {
        loadNotifications();

        const handleUpdate = () => loadNotifications();
        window.addEventListener('mock-notification-added', handleUpdate);
        window.addEventListener('mock-notification-updated', handleUpdate);

        return () => {
            window.removeEventListener('mock-notification-added', handleUpdate);
            window.removeEventListener('mock-notification-updated', handleUpdate);
        };
    }, []);

    const loadNotifications = () => {
        const notifs = MockNotificationService.getNotifications();
        setNotifications(notifs);
    };

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

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notification: any) => {
        // Mark as read
        MockNotificationService.markAsRead(notification.id);

        // Navigate to issue if applicable
        if (notification.issueId) {
            router.push(`/issues/${notification.issueId}`);
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = () => {
        MockNotificationService.markAllAsRead();
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            MockNotificationService.clearAll();
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'issue_created':
                return '🆕';
            case 'comment_added':
                return '💬';
            case 'issue_assigned':
                return '👤';
            case 'issue_updated':
                return '🔄';
            default:
                return '🔔';
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={popoverRef}>
            <div onClick={togglePopover} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                {unreadCount > 0 && (
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
                        {unreadCount > 99 ? '99+' : unreadCount}
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
                    maxWidth: '90vw',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
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
                            {notifications.length > 0 && (
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
                                    <Trash2 className="h-3 w-3 inline" /> Clear All
                                </button>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    fontSize: '12px',
                                    color: '#718096',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                type="button"
                            >
                                <Check className="h-3 w-3" /> Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                color: '#718096',
                                fontSize: '14px'
                            }}>
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p style={{ margin: 0 }}>No notifications yet</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                                    Create an issue or add a comment to see notifications!
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f7fafc',
                                        cursor: notification.issueId ? 'pointer' : 'default',
                                        backgroundColor: notification.read ? 'white' : '#f0f9ff',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (notification.issueId) {
                                            e.currentTarget.style.backgroundColor = '#e0f2fe';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f0f9ff';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                                        <span style={{ fontSize: '20px', flexShrink: 0 }}>
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: notification.read ? 'normal' : 'bold',
                                                fontSize: '14px',
                                                marginBottom: '4px',
                                                color: '#1a202c'
                                            }}>
                                                {notification.title}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#4a5568',
                                                lineHeight: '1.4'
                                            }}>
                                                {notification.message}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#a0aec0',
                                                marginTop: '6px'
                                            }}>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#3b82f6',
                                                flexShrink: 0,
                                                marginTop: '6px'
                                            }} />
                                        )}
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
