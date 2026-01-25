import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

type Action = 'VERIFY' | 'REJECT';

export class ModerateProfile {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(profileId: string, action: Action) {
        if (action === 'VERIFY') {
            return this.repo.verifyProfile(profileId);
        } else if (action === 'REJECT') {
            return this.repo.rejectProfile(profileId);
        }
        throw new Error('Invalid action');
    }
}
