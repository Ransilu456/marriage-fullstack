
import { IMessageRepository } from '../../core/interfaces/MessageRepository';
import { Message } from '../../core/entities/Message';
import { prisma } from './prismaClient';

export class MessageRepositoryPrisma implements IMessageRepository {
    async save(message: Message): Promise<Message> {
        const saved = await (prisma as any).message.create({
            data: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                matchId: message.matchId,
                isRead: message.read, // Corrected from read to isRead
                createdAt: message.createdAt
            }
        });
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<Message | null> {
        const found = await (prisma as any).message.findUnique({
            where: { id }
        });
        return found ? this.toDomain(found) : null;
    }

    async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
        const messages = await (prisma as any).message.findMany({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        return messages.map((m: any) => this.toDomain(m));
    }

    async markAsRead(messageId: string): Promise<void> {
        await (prisma as any).message.update({
            where: { id: messageId },
            data: { isRead: true } // Corrected field name
        });
    }

    async countRecentForUser(userId: string, hours: number): Promise<number> {
        const since = new Date();
        since.setHours(since.getHours() - hours);

        return await (prisma as any).message.count({
            where: {
                senderId: userId,
                createdAt: {
                    gte: since
                }
            }
        });
    }

    async findByMatchId(matchId: string): Promise<Message[]> {
        const messages = await (prisma as any).message.findMany({
            where: { matchId },
            orderBy: { createdAt: 'asc' }
        });

        return messages.map((m: any) => this.toDomain(m));
    }

    private toDomain(p: any): Message {
        return Message.create({
            id: p.id,
            content: p.content,
            senderId: p.senderId,
            receiverId: p.receiverId,
            matchId: p.matchId,
            read: p.isRead || p.read, // Handle both
            createdAt: p.createdAt
        });
    }
}
