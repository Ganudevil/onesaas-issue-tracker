
import { Injectable, Logger } from '@nestjs/common';
import { Novu } from '@novu/node';

@Injectable()
export class NovuService {
    private novu: Novu;
    private readonly logger = new Logger(NovuService.name);

    constructor() {
        // Fallback to hardcoded key if env var is missing/empty
        const apiKey = process.env.NOVU_API_KEY || '84ec40b73ccba3e7205185bff4e00ffe';
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
}
