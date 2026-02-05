// Custom Notification List Component
function CustomNotificationList({ removeNotification }: { removeNotification: (messageId: string) => Promise<void> }) {
    const { notifications, markNotificationAsRead } = useNotifications();
    const router = useRouter();

    const handleRemove = async (messageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await removeNotification(messageId);
            console.log('Notification removed:', messageId);
        } catch (error) {
            console.error('Error removing notification:', error);
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
            {notifications.map((notification: any) => (
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
                                fontSize: '16px',
                                lineHeight: 1,
                                flexShrink: 0
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
