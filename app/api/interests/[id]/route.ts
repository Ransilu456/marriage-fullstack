import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { AcceptInterestUseCase } from '@/src/core/use-cases/AcceptInterestUseCase';
import { RespondToInterestUseCase } from '@/src/core/use-cases/RespondToInterestUseCase';
import { InterestRepositoryPrisma } from '@/src/infrastructure/db/InterestRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { AuditLogRepositoryPrisma } from '@/src/infrastructure/db/AuditLogRepositoryPrisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { action } = await request.json(); // 'accept' or 'reject'

        const interestRepo = new InterestRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();
        const auditLogRepo = new AuditLogRepositoryPrisma();

        if (action === 'accept') {
            const useCase = new AcceptInterestUseCase(interestRepo, matchRepo, auditLogRepo);
            const match = await useCase.execute({
                interestId: id,
                recipientId: session.userId
            });
            return NextResponse.json({ success: true, match });
        } else if (action === 'reject') {
            const useCase = new RespondToInterestUseCase(interestRepo, matchRepo, userRepo);
            await useCase.execute(session.userId, id, 'DECLINED');
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
