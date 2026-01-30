// Mock notification service for client-side notifications
class MockNotificationService {
    private static STORAGE_KEY = 'mock_notifications';

    // Get all notifications from localStorage
    static getNotifications(): any[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[MockNotificationService] Error reading notifications:', error);
            return [];
        }
    }

    // Add a new notification
    static addNotification(notification: {
        title: string;
        message: string;
        type?: 'issue_created' | 'issue_updated' | 'comment_added' | 'issue_assigned';
        issueId?: string;
        metadata?: any;
    }) {
        try {
            const notifications = this.getNotifications();
            const newNotification = {
                id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...notification,
                createdAt: new Date().toISOString(),
                read: false,
            };

            notifications.unshift(newNotification); // Add to beginning
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));

            console.log('[MockNotificationService] Notification added:', newNotification);

            // Dispatch custom event for real-time updates
            window.dispatchEvent(new CustomEvent('mock-notification-added', {
                detail: newNotification
            }));

            return newNotification;
        } catch (error) {
            console.error('[MockNotificationService] Error adding notification:', error);
            return null;
        }
    }

    // Mark notification as read
    static markAsRead(notificationId: string) {
        try {
            const notifications = this.getNotifications();
            const updated = notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

            window.dispatchEvent(new CustomEvent('mock-notification-updated'));
        } catch (error) {
            console.error('[MockNotificationService] Error marking as read:', error);
        }
    }

    // Mark all notifications as read
    static markAllAsRead() {
        try {
            const notifications = this.getNotifications();
            const updated = notifications.map(n => ({ ...n, read: true }));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

            window.dispatchEvent(new CustomEvent('mock-notification-updated'));
        } catch (error) {
            console.error('[MockNotificationService] Error marking all as read:', error);
        }
    }

    // Clear all notifications
    static clearAll() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            window.dispatchEvent(new CustomEvent('mock-notification-updated'));
        } catch (error) {
            console.error('[MockNotificationService] Error clearing notifications:', error);
        }
    }

    // Get unread count
    static getUnreadCount(): number {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }

    // Trigger notification for issue created
    static notifyIssueCreated(issue: any, creatorName: string) {
        return this.addNotification({
            title: 'New Issue Created',
            message: `${creatorName} created issue: ${issue.title}`,
            type: 'issue_created',
            issueId: issue.id,
            metadata: { issue }
        });
    }

    // Trigger notification for comment added
    static notifyCommentAdded(issue: any, comment: string, commenterName: string) {
        return this.addNotification({
            title: 'New Comment',
            message: `${commenterName} commented on "${issue.title}": ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
            type: 'comment_added',
            issueId: issue.id,
            metadata: { issue, comment }
        });
    }

    // Trigger notification for issue assigned
    static notifyIssueAssigned(issue: any, assigneeName: string) {
        return this.addNotification({
            title: 'Issue Assigned to You',
            message: `You have been assigned to issue: ${issue.title}`,
            type: 'issue_assigned',
            issueId: issue.id,
            metadata: { issue }
        });
    }

    // Trigger notification for issue updated
    static notifyIssueUpdated(issue: any, updaterName: string, changes: string) {
        return this.addNotification({
            title: 'Issue Updated',
            message: `${updaterName} updated "${issue.title}": ${changes}`,
            type: 'issue_updated',
            issueId: issue.id,
            metadata: { issue, changes }
        });
    }
}

export default MockNotificationService;
