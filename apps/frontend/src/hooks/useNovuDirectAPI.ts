// Novu Direct API Helper - Bypasses broken Integration
import { useCallback, useEffect, useState, useRef } from 'react';

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

    // Ignore list for deleted notifications to prevent reappearance during polling
    const deletedIdsRef = useRef<Set<string>>(new Set());
    const readIdsRef = useRef<Set<string>>(new Set());

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://onesaas-backend.onrender.com/api';

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const deleted = JSON.parse(localStorage.getItem('novu_deleted_ids') || '[]');
            const read = JSON.parse(localStorage.getItem('novu_read_ids') || '[]');
            deletedIdsRef.current = new Set(deleted);
            readIdsRef.current = new Set(read);
        } catch (e) {
            console.error('Failed to load notification state', e);
        }
    }, []);

    const saveToStorage = useCallback(() => {
        try {
            localStorage.setItem('novu_deleted_ids', JSON.stringify(Array.from(deletedIdsRef.current)));
            localStorage.setItem('novu_read_ids', JSON.stringify(Array.from(readIdsRef.current)));
        } catch (e) {
            console.error('Failed to save notification state', e);
        }
    }, []);

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
            const rawMessages = data || [];

            // Filter out locally deleted messages and apply read status
            const messages = rawMessages
                .filter((m: any) => !deletedIdsRef.current.has(m._id) && !deletedIdsRef.current.has(m.id))
                .map((m: any) => {
                    if (readIdsRef.current.has(m._id) || readIdsRef.current.has(m.id)) {
                        return { ...m, read: true, seen: true };
                    }
                    return m;
                });

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

        // Optimistic Update & Persistence
        readIdsRef.current.add(id);
        saveToStorage();

        setNotifications(prev => prev.map(n => (n._id === id || (n as any).id === id) ? { ...n, read: true, seen: true } : n));
        setUnseenCount(prev => Math.max(0, prev - 1));

        try {
            await fetch(
                `${backendUrl}/notifications/${id}/read?subscriberId=${subscriberId}`,
                { method: 'POST' }
            );
            // fetchNotifications(); // Disabled to prevent race conditions reverting the optimistic UI
        } catch (error) {
            console.error('[Novu Proxy] Mark read failed:', error);
            // No revert needed as we persist read status locally
        }
    }, [subscriberId, backendUrl, saveToStorage]);

    const markAllAsRead = useCallback(async () => {
        if (!subscriberId) return;

        // Optimistic & Persistence
        const currentIds = notifications.map(n => n._id);
        currentIds.forEach(id => readIdsRef.current.add(id));
        saveToStorage();

        setNotifications(prev => prev.map(n => ({ ...n, read: true, seen: true })));
        setUnseenCount(0);

        try {
            await fetch(
                `${backendUrl}/notifications/mark-all-read?subscriberId=${subscriberId}`,
                { method: 'POST' }
            );
        } catch (error) {
            console.error('[Novu Proxy] Mark all read failed:', error);
            // fetchNotifications(); // No longer needed as state is persisted locally
        }
    }, [subscriberId, backendUrl, notifications, saveToStorage]);

    const removeNotification = useCallback(async (messageId: string | { messageId: string }) => {
        if (!subscriberId) return;
        const id = typeof messageId === 'string' ? messageId : messageId.messageId;

        // Add to ignore list immediately & Save
        deletedIdsRef.current.add(id);
        saveToStorage();

        // Optimistic Update
        setNotifications(prev => prev.filter(n => n._id !== id && (n as any).id !== id));

        const url = `${backendUrl}/notifications/${id}?subscriberId=${subscriberId}`;
        console.log('[Novu Proxy] Removing notification:', id, 'URL:', url);
        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) {
                console.error('[Novu Proxy] Remove failed:', res.status);
                // We DO NOT revert here because if it's already gone (404), it's fine.
                // If it's a 500, we might want to revert, but better to keep it hidden to avoid user confusion.
                // Only revert if we are sure it wasn't deleted. For now, keep it hidden.
            } else {
                console.log('[Novu Proxy] Remove success');
            }
        } catch (error) {
            console.error('[Novu Proxy] Remove network error:', error);
            // Verify later
        }
    }, [subscriberId, backendUrl, saveToStorage]); // fetchNotifications logic handles the filtering now

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
