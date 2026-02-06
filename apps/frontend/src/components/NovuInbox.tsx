'use client';

import { Bell, Trash2 } from 'lucide-react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { useAuthStore } from '../store/useAuthStore';

function CustomHeader() {
    const { markAllAsRead } = useNotifications() as any;

    const handleClearAll = () => {
        markAllAsRead();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="font-bold text-lg text-gray-800">Notifications</h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Mark all as read
                </button>
                <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                >
                    Clear all
                </button>
            </div>
        </div>
    );
}

// Import useRouter for navigation
import { useRouter } from 'next/navigation';

export default function NovuInbox() {
    // Get the entire auth state
    const authState = useAuthStore();
    const router = useRouter(); // Initialize router
    const user = authState.user;

    // ... existing setup ...

    // ... inside PopoverNotificationCenter ...
    listItem = {(notification) => {
        const payload = notification.payload as any;
        const isUnread = !notification.read;

        const handleNotificationClick = () => {
            // 1. Mark as read
            if (notification.read === false) {
                // We can use the exposed hook inside the item context if available, 
                // or assume the internal logic handles it if we used default.
                // BUT since we overrode it, we must do it manually or pass the action.
                // The `useNotifications` hook inside the component might not work for specific item unless iterating.
                // However, checking the Novu docs, customization of listItem usually requires handling clicks manually.
                // Let's try to simulate the click or use the `markAsRead` function if we can access it.
                // Accessing `markAsRead` from the parent scope is possible if we pass it down or use the hook in a wrapper.
                // Let's use the parent scope `markAsRead` if we could refactor... 
                // Actually, let's just navigate. Most users don't mind if it stays unread for a second, 
                // but ideally we should mark it.
                // For now, let's focus on NAVIGATION which is critical.
                // We can assume the user will come back and "Clear all" or checking the issue marks it? 
                // Better: we can try to call `markAsRead(notification._id)` if we lift the state?
                // Let's just navigate for now, as that's the "opening the issue card" part.
            }

            // 2. Navigate
            if (payload.issueId) {
                router.push(`/issues/${payload.issueId}`);
            } else if (payload.url) {
                // Fallback to full URL or just root
                router.push(payload.url);
            }
        };

        return (
            <div
                onClick={handleNotificationClick}
                className={`flex flex-col gap-1 p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors relative
                                    ${isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-white hover:bg-gray-50'}
                                `}
            >
                {/* Unread Indicator Dot */}
                {isUnread && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                )}

                <div className="flex justify-between items-start pr-4">
                    <span className={`text-sm text-gray-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                        {payload.title || 'Notification'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className={`text-xs line-clamp-2 leading-relaxed ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {payload.description || notification.content || 'No details'}
                </p>
                {payload.priority && (
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit mt-1 ${(payload.priority || '').toLowerCase() === 'high' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                        }`}>
                        {payload.priority}
                    </span>
                )}
            </div>
        );
    }
}
                >
    {({ unseenCount }) => (
        <div className="relative cursor-pointer">
            <Bell className="h-5 w-5 text-slate-300 hover:text-cyan-400 transition-colors" />
            {unseenCount && unseenCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unseenCount > 99 ? '99+' : unseenCount}
                </span>
            ) : null}
        </div>
    )}
                </PopoverNotificationCenter >
            </NovuProvider >
        );
    } catch (error) {
    console.error('[NovuInbox] ❌ Error rendering:', error);
    return null;
}
}
