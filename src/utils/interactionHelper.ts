import { prisma } from '@/src/infrastructure/db/prismaClient';
import { AccountStatus } from '@/src/core/entities/User';

export async function checkInterestLimits(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await (prisma as any).interest.count({
        where: {
            senderId: userId,
            createdAt: {
                gte: today
            }
        }
    });

    // Step 4.3: No unlimited browsing/interests for free/limited users
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { accountStatus: true }
    });

    const limit = (user?.accountStatus as any) === 'VERIFIED' ? 20 : 5;

    return {
        count,
        limit,
        hasReachedLimit: count >= limit
    };
}

export async function canInteract(userId: string, otherUserId: string) {
    const interest = await (prisma as any).interest.findFirst({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId, status: 'ACCEPTED' },
                { senderId: otherUserId, receiverId: userId, status: 'ACCEPTED' }
            ]
        }
    });

    return !!interest;
}
