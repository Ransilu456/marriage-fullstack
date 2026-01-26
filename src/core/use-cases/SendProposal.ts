import { Proposal } from '../entities/Proposal';
import { IProposalRepository } from '../interfaces/ProposalRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { INotificationRepository } from '../interfaces/NotificationRepository';

export class SendProposalUseCase {
    constructor(
        private proposalRepository: IProposalRepository,
        private profileRepository: IProfileRepository,
        private notificationRepo: INotificationRepository
    ) { }

    async execute(proposerId: string, recipientId: string, message?: string): Promise<Proposal> {
        // Validation: Proposer must have a profile
        const profile = await this.profileRepository.findByUserId(proposerId);
        if (!profile) {
            throw new Error("You must complete your profile before sending a proposal.");
        }

        // Create new proposal
        const proposal = Proposal.create(
            proposerId,
            recipientId,
            message
        );

        const savedProposal = await this.proposalRepository.save(proposal);

        // --- Notifications ---
        await this.notificationRepo.save({
            userId: recipientId,
            type: 'NEW_PROPOSAL',
            title: 'Formal Proposal Received! 💍',
            message: `User ${proposerId} has sent you a formal marriage proposal.`
        });

        return savedProposal;
    }
}
