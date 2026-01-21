
import { IInterestRepository } from '../interfaces/IInterestRepository';
import { IUserRepository } from '../interfaces/UserRepository';
import { InterestStatus } from '../entities/Interest';
import { IMatchRepository } from '../interfaces/IMatchRepository';
import { Match } from '../entities/Match';

export class RespondToInterestUseCase {
    constructor(
        private interestRepo: IInterestRepository,
        private matchRepo: IMatchRepository,
        private userRepo: IUserRepository
    ) { }

    async execute(userId: string, interestId: string, action: 'ACCEPTED' | 'DECLINED' | 'ENGAGED'): Promise<void> {
        const interest = await this.interestRepo.findById(interestId);

        if (!interest) {
            throw new Error("Interest not found.");
        }

        if (interest.receiverId !== userId) {
            throw new Error("You are not authorized to respond to this interest.");
        }

        let newStatus: InterestStatus;
        if (action === 'ACCEPTED') newStatus = InterestStatus.ACCEPTED;
        else if (action === 'DECLINED') newStatus = InterestStatus.REJECTED;
        else if (action === 'ENGAGED') newStatus = InterestStatus.ENGAGED;
        else throw new Error("Invalid action");

        // Update Interest Status
        await this.interestRepo.updateStatus(interestId, newStatus);

        // If Accepted, Create Match
        if (newStatus === InterestStatus.ACCEPTED) {
            const existing = await this.matchRepo.findByUsers(interest.senderId, interest.receiverId);
            if (!existing) {
                const match = Match.create({
                    userAId: interest.senderId,
                    userBId: interest.receiverId
                });
                await this.matchRepo.save(match);
            }
        }

        // If Engaged, Update User Status
        if (newStatus === InterestStatus.ENGAGED) {
            // Update both users to ENGAGED
            await this.userRepo.updateAccountStatus(interest.senderId, 'ENGAGED');
            await this.userRepo.updateAccountStatus(interest.receiverId, 'ENGAGED');
        }
    }
}
