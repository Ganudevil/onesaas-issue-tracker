// Novu Subscriber Management
import { Novu } from '@novu/node';

const NOVU_API_KEY = process.env.NOVU_API_KEY || '';

// Initialize Novu SDK
const novu = new Novu(NOVU_API_KEY);

/**
 * Create or update a subscriber in Novu
 * This ensures the user exists in Novu before they try to access notifications
 */
export async function syncNovuSubscriber(
    subscriberId: string,
    email: string,
    firstName?: string,
    lastName?: string
) {
    try {
        console.log('[Novu] Syncing subscriber:', subscriberId);

        await novu.subscribers.identify(subscriberId, {
            email: email,
            firstName: firstName || '',
            lastName: lastName || '',
        });

        console.log('[Novu] Subscriber synced successfully:', subscriberId);
        return { success: true };
    } catch (error) {
        console.error('[Novu] Error syncing subscriber:', error);
        return { success: false, error };
    }
}

/**
 * Trigger a notification for a subscriber
 */
export async function triggerNovuNotification(
    workflowId: string,
    subscriberId: string,
    payload: Record<string, any>
) {
    try {
        console.log('[Novu] Triggering notification:', { workflowId, subscriberId });

        await novu.trigger(workflowId, {
            to: {
                subscriberId: subscriberId,
            },
            payload: payload,
        });

        console.log('[Novu] Notification triggered successfully');
        return { success: true };
    } catch (error) {
        console.error('[Novu] Error triggering notification:', error);
        return { success: false, error };
    }
}
