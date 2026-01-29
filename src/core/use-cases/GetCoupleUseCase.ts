
import { IProposalRepository } from '../interfaces/ProposalRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { ProposalAnswer } from '../entities/Proposal';
import { Profile } from '../entities/Profile';

export interface CoupleData {
    partnerProfile: Profile;
    relationshipStartDate: Date;
    status: 'ENGAGED' | 'MATCHED';
}

export class GetCoupleUseCase {
    constructor(
        private proposalRepo: IProposalRepository,
        private profileRepo: IProfileRepository
    ) { }

    async execute(userId: string): Promise<CoupleData | null> {
        // 1. Check for Accepted Proposal (Engaged)
        // We need to find if the user is either proposer or recipient in a YES proposal
        // The repository doesn't have a specific "findAcceptedByUserId" so we'll fetch by user and filter
        // Ideally we should add a specific method to the repo, but for now we filter.

        // Optimization: Check if user is recipient of any accepted proposal
        const recieved = await this.proposalRepo.findByRecipientId(userId);
        const acceptedReceived = recieved.find(p => p.answer === ProposalAnswer.YES);

        if (acceptedReceived) {
            const partnerProfile = await this.profileRepo.findByUserId(acceptedReceived.proposerId);
            if (partnerProfile) {
                return {
                    partnerProfile,
                    relationshipStartDate: acceptedReceived.updatedAt || new Date(),
                    status: 'ENGAGED'
                };
            }
        }

        // Check if user is proposer of any accepted proposal
        const sent = await this.proposalRepo.findByProposerId(userId);
        const acceptedSent = sent.find(p => p.answer === ProposalAnswer.YES);

        if (acceptedSent) {
            const partnerProfile = await this.profileRepo.findByUserId(acceptedSent.recipientId);
            if (partnerProfile) {
                return {
                    partnerProfile,
                    relationshipStartDate: acceptedSent.updatedAt || new Date(),
                    status: 'ENGAGED'
                };
            }
        }

        return null;
    }
}
