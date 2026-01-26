/**
 * Use Case: Submit Answer
 * 
 * Handles the business logic for submitting a proposal answer.
 * This use case is framework-agnostic and testable.
 */

import { Proposal, ProposalAnswer } from '../entities/Proposal';
import { IProposalRepository } from '../interfaces/ProposalRepository';
import { IEmailService } from '../interfaces/EmailService';
import { INotificationRepository } from '../interfaces/NotificationRepository';

export interface SubmitAnswerInput {
    proposalId: string;
    answer: 'YES' | 'NO';
    message?: string;
}

export interface SubmitAnswerOutput {
    success: boolean;
    proposal: Proposal;
    emailSent: boolean;
}

export class SubmitAnswerUseCase {
    constructor(
        private proposalRepository: IProposalRepository,
        private emailService: IEmailService,
        private notificationRepo: INotificationRepository
    ) { }

    async execute(input: SubmitAnswerInput): Promise<SubmitAnswerOutput> {
        // Validate input
        if (!input.answer || !['YES', 'NO'].includes(input.answer)) {
            throw new Error('Invalid answer. Must be YES or NO');
        }

        // Convert string to enum
        const answer = input.answer === 'YES'
            ? ProposalAnswer.YES
            : ProposalAnswer.NO;

        // Find existing proposal by ID
        const proposal = await this.proposalRepository.findById(input.proposalId);

        if (!proposal) {
            throw new Error('Proposal not found.');
        }

        if (!proposal.isPending()) {
            throw new Error('This proposal has already been answered.');
        }

        // Submit the answer
        proposal.submitAnswer(answer, input.message);

        // Save to repository
        const savedProposal = await this.proposalRepository.save(proposal);

        // --- Notifications ---

        // 1. Notify Proposer
        await this.notificationRepo.save({
            userId: savedProposal.proposerId,
            type: 'PROPOSAL_RESPONSE',
            title: savedProposal.isAccepted() ? 'Proposal Accepted! 🎉' : 'Proposal Update',
            message: `User ${savedProposal.recipientId} has ${savedProposal.answer.toLowerCase()}ed your proposal.`
        });

        // 2. Notify Recipient (Confirmation)
        await this.notificationRepo.save({
            userId: savedProposal.recipientId,
            type: 'PROPOSAL_SUBMITTED',
            title: 'Answer Submitted',
            message: `You have ${savedProposal.answer.toLowerCase()}ed the proposal from ${savedProposal.proposerId}.`
        });

        // 3. Notify Admin (if accepted)
        if (savedProposal.isAccepted()) {
            // In a real system, you'd find admin IDs. For now, we use a generic placeholder or specific logic.
            // Assumption: there's an admin user or a system notification role.
            // For now, let's just log it or notify a known admin ID if available.
            // We'll skip for now or use a mock admin ID.
        }

        // Send email notification if accepted
        let emailSent = false;
        if (savedProposal.isAccepted()) {
            try {
                await this.emailService.sendProposalAccepted(savedProposal);
                emailSent = true;
            } catch (error) {
                console.error('Failed to send email notification:', error);
            }
        }

        return {
            success: true,
            proposal: savedProposal,
            emailSent,
        };
    }
}
