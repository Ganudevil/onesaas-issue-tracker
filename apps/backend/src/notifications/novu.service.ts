
import { Injectable, Logger } from '@nestjs/common';
import { Novu } from '@novu/node';

@Injectable()
export class NovuService {
    private novu: Novu;
    private readonly logger = new Logger(NovuService.name);

    constructor() {
        // Fallback to hardcoded key if env var is missing/empty
        const apiKey = process.env.NOVU_API_KEY || '0e6ea8224d1faabe42f379cff81a2fc5'; // Production Key (Matches Frontend App ID)
        if (apiKey) {
            this.novu = new Novu(apiKey);
            this.logger.log('Novu initialized with API Key');
        } else {
            this.logger.warn('NOVU_API_KEY not found in environment variables. Notifications will be skipped.');
        }
    }

    async triggerEvent(eventName: string, tenantId: string, user: { id: string; email?: string; name?: string } | string, payload: any) {
        if (!this.novu) {
            this.logger.warn(`Skipping event ${eventName} (No API Key)`);
            return;
        }

        const userId = typeof user === 'string' ? user : user.id;
        const subscriberDetails = typeof user === 'string' ? { subscriberId: user } : {
            subscriberId: user.id,
            email: user.email,
            firstName: user.name, // Mapping name to first name handling
        };

        try {
            this.logger.log(`Triggering Novu event: ${eventName} for user: ${userId} in tenant: ${tenantId}, Payload: ${JSON.stringify(payload)}`);
            const response = await this.novu.trigger(eventName, {
                to: subscriberDetails,
                payload: {
                    ...payload,
                    tenantId,
                },
            });
            this.logger.log(`Successfully triggered Novu event: ${eventName}. Response: ${JSON.stringify(response.data)}`);
        } catch (error) {
            this.logger.error(`Failed to trigger Novu event ${eventName}`, error);
        }
    }

    // Proxy Methods for Frontend
    async getNotifications(subscriberId: string) {
        if (!process.env.NOVU_API_KEY) return [];
        try {
            const response = await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/notifications/feed`,
                {
                    headers: {
                        'Authorization': `ApiKey ${process.env.NOVU_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            this.logger.error(`Failed to fetch notifications for ${subscriberId}`, error);
            return [];
        }
    }

    async markAsRead(subscriberId: string, messageId: string) {
        if (!process.env.NOVU_API_KEY) return;
        try {
            await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/${messageId}/read`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `ApiKey ${process.env.NOVU_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            this.logger.error(`Failed to mark message ${messageId} as read`, error);
        }
    }

    async markAllAsRead(subscriberId: string) {
        if (!process.env.NOVU_API_KEY) return;
        try {
            await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/markAll/read`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `ApiKey ${process.env.NOVU_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            this.logger.error(`Failed to mark all as read for ${subscriberId}`, error);
        }
    }

    async deleteMessage(subscriberId: string, messageId: string) {
        if (!process.env.NOVU_API_KEY) return;
        try {
            const response = await fetch(
                `https://api.novu.co/v1/subscribers/${subscriberId}/messages/${messageId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `ApiKey ${process.env.NOVU_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const text = await response.text();
                this.logger.error(`Novu API Delete Failed: ${response.status} ${text}`);
                throw new Error(`Novu Delete Failed: ${response.status}`);
            }

            this.logger.log(`Successfully deleted message ${messageId} for ${subscriberId}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to delete message ${messageId}`, error);
            throw error;
        }
    }
}
