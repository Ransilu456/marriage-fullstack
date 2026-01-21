import { NextResponse } from 'next/server';
import { SendProposalUseCase } from '@/src/core/use-cases/SendProposal';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { canInteract } from '@/src/utils/interactionHelper';
import { getSession } from '@/src/lib/auth';

const proposalRepo = new ProposalRepositoryPrisma();
const profileRepo = new ProfileRepositoryPrisma();
const sendProposalUseCase = new SendProposalUseCase(proposalRepo, profileRepo);

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
