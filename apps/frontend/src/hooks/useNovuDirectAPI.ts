// Novu Direct API Helper - Bypasses broken Integration
import { useCallback, useEffect, useState } from 'react';

interface NotificationMessage {
    _id: string;
    content: string;
    seen: boolean;
    read: boolean;
    payload: any;
    createdAt: string;
}

export function useNovuDirectAPI(subscriberId: string | null, appId: string) {
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unseenCount, setUnseenCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!subscriberId) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/notifications/feed`,
                { headers: { 'Authorization': `ApiKey ${appId}` } }
            );

            if (!response.ok) {
                console.error('[Novu Direct] API error:', response.status);
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            const messages = data.data?.data || [];

            console.log('[Novu Direct] Fetched', messages.length, 'notifications');
            setNotifications(messages);
            setUnseenCount(messages.filter((m: any) => !m.seen).length);
        } catch (error) {
            console.error('[Novu Direct] Fetch failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [subscriberId, appId]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (messageId: string) => {
        if (!subscriberId) return;
        try {
            await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/${messageId}/read`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `ApiKey ${appId}` }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Direct] Mark read failed:', error);
        }
    }, [subscriberId, appId, fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        if (!subscriberId) return;
        try {
            await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/markAll/read`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `ApiKey ${appId}` }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Direct] Mark all read failed:', error);
        }
    }, [subscriberId, appId, fetchNotifications]);

    const removeNotification = useCallback(async (messageId: string) => {
        if (!subscriberId) return;
        try {
            await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/${messageId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `ApiKey ${appId}` }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Direct] Remove failed:', error);
        }
    }, [subscriberId, appId, fetchNotifications]);

    return {
        notifications,
        isLoading,
        unseenCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refetch: fetchNotifications
    };
}
