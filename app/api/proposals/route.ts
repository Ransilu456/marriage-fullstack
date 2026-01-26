import { NextResponse } from 'next/server';
import { SendProposalUseCase } from '@/src/core/use-cases/SendProposal';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { NotificationRepositoryPrisma } from '@/src/infrastructure/db/NotificationRepositoryPrisma';
import { canInteract } from '@/src/utils/interactionHelper';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { getSession } from '@/src/lib/auth';

const proposalRepo = new ProposalRepositoryPrisma();
const profileRepo = new ProfileRepositoryPrisma();
const notificationRepo = new NotificationRepositoryPrisma();
const sendProposalUseCase = new SendProposalUseCase(proposalRepo, profileRepo, notificationRepo);

export async function GET(req: Request) {
    const payload = await getSession();
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    try {
        const proposals = await (prisma as any).proposal.findMany({
            where: {
                OR: [
                    { proposerId: payload.userId },
                    { recipientId: payload.userId }
                ]
            },
            include: {
                proposer: {
                    select: {
                        id: true,
                        name: true,
                        profile: { select: { photoUrl: true } }
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        name: true,
                        profile: { select: { photoUrl: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, proposals });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const payload = await getSession();
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    try {
        const { receiverId, message } = await req.json();
        if (!receiverId) return NextResponse.json({ success: false, error: 'Recipient ID is required' }, { status: 400 });

        // Basic permission check via helper
        const allowed = await canInteract(payload.userId, receiverId);
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Mutual interest required for formal proposals.' }, { status: 403 });
        }

        await sendProposalUseCase.execute(payload.userId, receiverId, message);

        return NextResponse.json({ success: true, message: 'Proposal dispatched successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
