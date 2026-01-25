import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

type Action = 'DELETE' | 'BAN' | 'UNBAN';

export class ManageUsers {
    constructor(private repo = new AdminRepositoryPrisma()) { }

    async execute(userId: string, action: Action) {
        if (action === 'DELETE') {
            return this.repo.deleteUser(userId);
        }
        if (action === 'BAN') {
            return this.repo.banUser(userId);
        }
        if (action === 'UNBAN') {
            return this.repo.unbanUser(userId);
        }
        throw new Error('Invalid action');
    }
}
