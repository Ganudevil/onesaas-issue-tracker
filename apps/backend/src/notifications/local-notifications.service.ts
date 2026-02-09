import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) { }

    async createNotification(data: {
        userId: string;
        tenantId: string;
        type: string;
        title: string;
        content: string;
        payload?: any;
    }) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    id: uuidv4(),
                    userId: data.userId,
                    tenantId: data.tenantId,
                    type: data.type,
                    title: data.title,
                    content: data.content,
                    payload: data.payload || {},
                    read: false,
                    seen: false,
                },
            });
            this.logger.log(`Created notification: ${notification.id}`);
            return notification;
        } catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`);
            throw error;
        }
    }

    async getUserNotifications(userId: string, limit = 50) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getUnseenCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, seen: false },
        });
    }

    async markAsRead(notificationId: string) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true, seen: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId },
            data: { read: true, seen: true },
        });
    }

    async deleteNotification(notificationId: string) {
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}
