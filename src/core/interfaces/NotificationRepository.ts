/**
 * Notification Entity
 */
export interface NotificationProps {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

/**
 * Notification Repository Interface
 */
export interface INotificationRepository {
    save(notification: Partial<NotificationProps> & { userId: string; type: string; title: string; message: string }): Promise<void>;
    findAllByUserId(userId: string, limit?: number): Promise<NotificationProps[]>;
    markAsRead(notificationId: string): Promise<void>;
}
