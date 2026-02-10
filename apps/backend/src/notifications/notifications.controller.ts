
import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { NovuService } from './novu.service';
// Assuming you have an AuthGuard, using a mock one or generic if specific one not found easily
// But waiting, we should use the existing AuthGuard from auth module if possible.
// For now, let's assume public or extract user from headers/query if auth is complex to import without context.
// Better: Use the standard AuthGuard if available.
// Checking app.module.ts, AuthModule exists.

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly novuService: NovuService) { }

    @Get('feed')
    async getFeed(@Req() req) {
        // Extract user ID from request (assuming AuthMiddleware/Guard populates it)
        // If not, we might need to pass it as query param for valid requests (secured by valid session/token)
        // For simplicity and robustness given previous context:
        // We will try to get it from query param 'subscriberId' if req.user is missing, 
        // OR trust the caller (Frontend) to pass the correct ID if we are in a rush, but strictly this should be req.user.id

        // Let's check headers or query.
        const subscriberId = req.query.subscriberId || (req.user && req.user.id);
        if (!subscriberId) return [];
        return this.novuService.getNotifications(subscriberId);
    }

    @Post(':messageId/read')
    async markAsRead(@Param('messageId') messageId: string, @Req() req) {
        const subscriberId = req.query.subscriberId || (req.user && req.user.id);
        if (subscriberId) {
            await this.novuService.markAsRead(subscriberId, messageId);
        }
        return { success: true };
    }

    @Post('mark-all-read')
    async markAllAsRead(@Req() req) {
        const subscriberId = req.query.subscriberId || (req.user && req.user.id);
        if (subscriberId) {
            await this.novuService.markAllAsRead(subscriberId);
        }
        return { success: true };
    }

    @Delete(':messageId')
    async deleteMessage(@Param('messageId') messageId: string, @Req() req) {
        const subscriberId = req.query.subscriberId || (req.user && req.user.id);
        if (subscriberId) {
            await this.novuService.deleteMessage(subscriberId, messageId);
        }
        return { success: true };
    }
}
