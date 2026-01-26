import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId: targetUserId } = await params;
        const currentUserId = session.userId;

        // 1. Check Interest
        const interest = await prisma.interest.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            }
        });

        // 2. Check Match
        const match = await prisma.match.findFirst({
            where: {
                OR: [
                    { userAId: currentUserId, userBId: targetUserId },
                    { userAId: targetUserId, userBId: currentUserId }
                ]
            }
        });

        // 3. Check Formal Proposal
        const proposal = await (prisma as any).proposal.findFirst({
            where: {
                OR: [
                    { proposerId: currentUserId, recipientId: targetUserId },
                    { proposerId: targetUserId, recipientId: currentUserId }
                ]
            }
        });

        return NextResponse.json({
            success: true,
            status: {
                hasInterest: !!interest,
                interestStatus: interest?.status || null,
                isMatched: !!match,
                hasProposal: !!proposal,
                proposalStatus: proposal?.answer || null,
                proposalId: proposal?.id || null,
                canSendProposal: !!match && !proposal
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
