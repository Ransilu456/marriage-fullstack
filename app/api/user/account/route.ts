import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { DeleteAccountUseCase } from '@/src/core/use-cases/DeleteAccountUseCase';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId;

        const matchRepo = new MatchRepositoryPrisma();
        const proposalRepo = new ProposalRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();

        // 1. Total Matches
        const matches = await matchRepo.findAllForUser(userId);
        const totalMatches = matches.length;

        // 2. Pending Proposals Received
        const pendingProposals = await (prisma as any).proposal.count({
            where: {
                recipientId: userId,
                answer: 'PENDING'
            }
        });

        // 3. Unread Messages Received
        // This is a bit complex due to Match schema, let's simplify with direct prisma query
        const unreadMessages = await (prisma as any).message.count({
            where: {
                match: {
                    OR: [
                        { userAId: userId },
                        { userBId: userId }
                    ]
                },
                senderId: { not: userId },
                isRead: false
            }
        });

        // 4. Profile & Verification Status
        const [user, profile] = await Promise.all([
            userRepo.findById(userId),
            profileRepo.findByUserId(userId)
        ]);

        return NextResponse.json({
            success: true,
            matches: totalMatches,
            proposals: pendingProposals,
            messages: unreadMessages,
            profileCompletion: profile?.toJSON().completionPercentage || 0,
            verificationStatus: user?.accountStatus?.toLowerCase() || 'pending',
            trustScore: user?.trustScore || 0
        });

    } catch (error: any) {
        console.error('Dashboard stats API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const deleteAccountUseCase = new DeleteAccountUseCase();
        const result = await deleteAccountUseCase.execute(session.userId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to delete account' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Delete account API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
