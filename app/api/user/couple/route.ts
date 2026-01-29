import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { GetCoupleUseCase } from '@/src/core/use-cases/GetCoupleUseCase';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const proposalRepo = new ProposalRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const useCase = new GetCoupleUseCase(proposalRepo, profileRepo);

        const coupleData = await useCase.execute(session.userId);

        if (!coupleData) {
            return NextResponse.json({ found: false });
        }

        // Return flattened data for frontend
        return NextResponse.json({
            found: true,
            partner: coupleData.partnerProfile.toJSON(),
            startDate: coupleData.relationshipStartDate,
            status: coupleData.status
        });

    } catch (error: any) {
        console.error('Error in GET /api/user/couple:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
