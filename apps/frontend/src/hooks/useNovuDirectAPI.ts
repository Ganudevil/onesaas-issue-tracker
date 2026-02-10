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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://onesaas-backend.onrender.com/api';

    const fetchNotifications = useCallback(async () => {
        if (!subscriberId) {
            setIsLoading(false);
            return;
        }

        try {
            // Use backend proxy
            const response = await fetch(
                `${backendUrl}/notifications/feed?subscriberId=${subscriberId}`
            );

            if (!response.ok) {
                console.error('[Novu Proxy] API error:', response.status);
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            const messages = data || []; // Backend returns data.data already

            console.log('[Novu Proxy] Fetched', messages.length, 'notifications');
            setNotifications(messages);
            setUnseenCount(messages.filter((m: any) => !m.seen).length);
        } catch (error) {
            console.error('[Novu Proxy] Fetch failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [subscriberId, backendUrl]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (messageId: string | { messageId: string }) => {
        if (!subscriberId) return;
        const id = typeof messageId === 'string' ? messageId : messageId.messageId;
        try {
            await fetch(
                `${backendUrl}/notifications/${id}/read?subscriberId=${subscriberId}`,
                { method: 'POST' }
            );
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Proxy] Mark read failed:', error);
        }
    }, [subscriberId, backendUrl, fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        if (!subscriberId) return;
        try {
            await fetch(
                `${backendUrl}/notifications/mark-all-read?subscriberId=${subscriberId}`,
                { method: 'POST' }
            );
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Proxy] Mark all read failed:', error);
        }
    }, [subscriberId, backendUrl, fetchNotifications]);

    const removeNotification = useCallback(async (messageId: string | { messageId: string }) => {
        if (!subscriberId) return;
        const id = typeof messageId === 'string' ? messageId : messageId.messageId;
        const url = `${backendUrl}/notifications/${id}?subscriberId=${subscriberId}`;
        console.log('[Novu Proxy] Removing notification:', id, 'URL:', url);
        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                console.error('[Novu Proxy] Remove failed:', res.status, text);
            } else {
                console.log('[Novu Proxy] Remove success');
            }
            fetchNotifications();
        } catch (error) {
            console.error('[Novu Proxy] Remove network error:', error);
        }
    }, [subscriberId, backendUrl, fetchNotifications]);

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
