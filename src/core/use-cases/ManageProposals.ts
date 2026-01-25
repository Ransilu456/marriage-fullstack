import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

type Action = 'DELETE';

export class ManageProposals {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(proposalId: string, action: Action) {
        if (action === 'DELETE') {
            return this.repo.deleteProposal(proposalId);
        }
        throw new Error('Invalid action');
    }
}
