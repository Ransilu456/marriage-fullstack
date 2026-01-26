import { INotificationRepository, NotificationProps } from '../../core/interfaces/NotificationRepository';
import { prisma } from './prismaClient';
import { notificationBus } from '../events/NotificationBus';

export class NotificationRepositoryPrisma implements INotificationRepository {
    async save(notification: Partial<NotificationProps> & { userId: string; type: string; title: string; message: string }): Promise<void> {
        const created = await prisma.notification.create({
            data: {
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link || null,
                read: notification.read || false
            }
        });

        // Emit via SSE bus
        notificationBus.emitNotification(notification.userId, created);
    }

    async findAllByUserId(userId: string, limit: number = 20): Promise<NotificationProps[]> {
        const notes = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return notes.map(n => ({
            ...n,
            link: n.link || undefined
        }));
    }

    async markAsRead(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
    }
}
