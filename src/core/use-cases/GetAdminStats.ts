import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export class GetAdminStats {
  constructor(private repo = new AdminRepositoryPrisma()) { }

  async execute() {
    return this.repo.getDashboardStats();
  }
}