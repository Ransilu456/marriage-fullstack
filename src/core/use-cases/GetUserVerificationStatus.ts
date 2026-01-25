import { IUserRepository } from '../interfaces/UserRepository';
import { prisma } from '../../infrastructure/db/prismaClient';

export class GetUserVerificationStatus {
    constructor(private userRepo: IUserRepository) { }

    async execute(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Cross-check with actual verification documents to ensure data integrity
        const [activeIdDocs, activePhotoDocs] = await Promise.all([
            prisma.verification.count({ where: { userId, documentType: 'ID', status: 'VERIFIED' } }),
            prisma.verification.count({ where: { userId, documentType: 'PHOTO', status: 'VERIFIED' } })
        ]);

        return {
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            photoVerified: activePhotoDocs > 0 ? true : false,
            idVerified: activeIdDocs > 0 ? true : false,
            trustScore: user.trustScore
        };
    }
}
