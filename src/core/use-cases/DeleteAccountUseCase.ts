import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeleteAccountUseCase {
    async execute(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            // Verify user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Delete user - cascade will handle all related records
            // (Profile, Interests, Messages, Verifications, Reports, Blocks, etc.)
            await prisma.user.delete({
                where: { id: userId }
            });

            return {
                success: true,
                message: 'Account deleted successfully'
            };
        } catch (error: any) {
            console.error('Delete account error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete account'
            };
        }
    }
}
