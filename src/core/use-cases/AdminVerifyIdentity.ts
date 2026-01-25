import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export class AdminVerifyIdentity {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(verificationId: string, action: 'VERIFY' | 'REJECT' | 'REVOKE', notes?: string) {
        return this.repo.processVerification(verificationId, action, notes);
    }
}
