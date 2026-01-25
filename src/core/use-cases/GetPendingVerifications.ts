import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export class GetPendingVerifications {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(page: number, limit: number) {
        return this.repo.getPendingVerifications(page, limit);
    }
}
