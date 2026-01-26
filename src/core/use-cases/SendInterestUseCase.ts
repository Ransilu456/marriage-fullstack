import { IInterestRepository } from '../interfaces/IInterestRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Interest } from '../entities/Interest';
import { IMatchRepository } from '../interfaces/IMatchRepository';
import { UserRole } from '../entities/User';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository';
import { AuditLog } from '../entities/AuditLog';
import { INotificationRepository } from '../interfaces/NotificationRepository';

export interface SendInterestInput {
    senderId: string;
    senderRole: UserRole;
    receiverId: string;
    message?: string;
}

export class SendInterestUseCase {
    private readonly DAILY_LIMIT = 5;

    constructor(
        private interestRepo: IInterestRepository,
        private profileRepo: IProfileRepository,
        private matchRepo: IMatchRepository,
        private auditLogRepo: IAuditLogRepository,
        private notificationRepo: INotificationRepository
    ) { }

    async execute(input: SendInterestInput): Promise<Interest> {
        // 0. Guardian restriction
        if (input.senderRole === UserRole.GUARDIAN) {
            throw new Error("Guardians are not allowed to send interests. Only the individual seeking marriage can initiate contact.");
        }

        // 1. Basic validation
        if (input.senderId === input.receiverId) {
            throw new Error("You cannot send an interest to yourself");
        }

        // 2. Check sender profile completion (Strict: 80% required)
        const senderProfile = await this.profileRepo.findByUserId(input.senderId);
        if (!senderProfile) {
            throw new Error("Profile not found. Please create a profile first.");
        }

        if (!senderProfile.isReadyForInteractions()) {
            const completion = senderProfile.calculateCompletion();
            throw new Error(`Your profile is only ${completion}% complete. You must reach 80% to send interests.`);
        }

        // 3. Check for existing Match (Chat)
        const existingMatch = await this.matchRepo.findByUsers(input.senderId, input.receiverId);
        if (existingMatch) {
            throw new Error("You are already matched with this user.");
        }

        // 4. Check for existing Interest
        const existingInterest = await this.interestRepo.findByUsers(input.senderId, input.receiverId);
        if (existingInterest) {
            throw new Error("An interest already exists between you two.");
        }

        // 5. Enforce Daily Limit (Serious Intent)
        const dailyCount = await this.interestRepo.countDailyForUser(input.senderId);
        if (dailyCount >= this.DAILY_LIMIT) {
            throw new Error(`Daily limit of ${this.DAILY_LIMIT} interests reached. Please come back tomorrow.`);
        }

        // 6. Create and Save Interest
        const interest = Interest.create({
            senderId: input.senderId,
            receiverId: input.receiverId,
            message: input.message
        });

        await this.interestRepo.save(interest);

        // --- Notifications ---
        await this.notificationRepo.save({
            userId: input.receiverId,
            type: 'NEW_INTEREST',
            title: 'New Interest! ✨',
            message: `User ${input.senderId} has expressed interest in your profile.`
        });

        // 7. Audit Log
        await this.auditLogRepo.save(AuditLog.create({
            userId: input.senderId,
            action: 'SEND_INTEREST',
            resource: input.receiverId,
            metadata: { message: input.message }
        }));

        return interest;
    }
}
