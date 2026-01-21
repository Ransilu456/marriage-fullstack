
import { IMessageRepository } from '../interfaces/MessageRepository';
import { IMatchRepository } from '../interfaces/IMatchRepository';
import { Message, MessageType } from '../entities/Message';
import { UserRole } from '../entities/User';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository';
import { AuditLog } from '../entities/AuditLog';

export interface SendMessageInput {
    matchId: string;
    senderId: string;
    senderRole: UserRole;
    content: string;
    type?: MessageType; // Added optional type
}

export class SendMessageUseCase {
    private readonly HOURLY_LIMIT = 50;
    private readonly DAILY_LIMIT = 500;

    constructor(
        private messageRepo: IMessageRepository,
        private matchRepo: IMatchRepository,
        private auditLogRepo: IAuditLogRepository
    ) { }

    async execute(input: SendMessageInput): Promise<Message> {
        // 0. Guardian restriction
        if (input.senderRole === UserRole.GUARDIAN) {
            throw new Error("Guardians are not allowed to send messages directly.");
        }

        // 1. Verify Match exists and user belongs to it
        const match = await this.matchRepo.findById(input.matchId);
        if (!match) {
            throw new Error("Match connection not found");
        }

        if (match.userAId !== input.senderId && match.userBId !== input.senderId) {
            throw new Error("You are not part of this match");
        }

        // 2. Identify Receiver
        const receiverId = match.userAId === input.senderId ? match.userBId : match.userAId;

        // 3. Rate Limiting (Anti-Spam)
        const recentCount = await this.messageRepo.countRecentForUser(input.senderId, 1); // Last 1 hour
        if (recentCount >= this.HOURLY_LIMIT) {
            throw new Error("Messaging hourly limit reached. Please slow down.");
        }

        const dailyCount = await this.messageRepo.countRecentForUser(input.senderId, 24); // Last 24 hours
        if (dailyCount >= this.DAILY_LIMIT) {
            throw new Error("Daily messaging limit reached. Serious matrimonial platforms prioritize quality over quantity.");
        }

        // 4. Create and Save Message
        const message = Message.create({
            content: input.content,
            senderId: input.senderId,
            receiverId: receiverId,
            matchId: input.matchId,
            type: input.type // Added type
        });

        await this.messageRepo.save(message);

        // 5. Audit Log (Optional but recommended for serious apps)
        await this.auditLogRepo.save(AuditLog.create({
            userId: input.senderId,
            action: 'SEND_MESSAGE',
            resource: input.matchId,
            metadata: { messageLength: input.content.length }
        }));

        return message;
    }
}
