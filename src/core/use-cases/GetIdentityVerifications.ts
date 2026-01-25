import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export class GetIdentityVerifications {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(page: number, limit: number, status?: string, userId?: string) {
        return this.repo.getIdentityVerifications(page, limit, status, userId);
    }
}
