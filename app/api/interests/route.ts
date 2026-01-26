import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { GetInterestsUseCase } from '@/src/core/use-cases/GetInterestsUseCase';
import { SendInterestUseCase } from '@/src/core/use-cases/SendInterestUseCase';
import { InterestRepositoryPrisma } from '@/src/infrastructure/db/InterestRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { AuditLogRepositoryPrisma } from '@/src/infrastructure/db/AuditLogRepositoryPrisma';
import { NotificationRepositoryPrisma } from '@/src/infrastructure/db/NotificationRepositoryPrisma';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = (searchParams.get('type') as 'sent' | 'received') || 'received';

        const interestRepo = new InterestRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const useCase = new GetInterestsUseCase(interestRepo, profileRepo);

        const interests = await useCase.execute(session.userId, type);

        return NextResponse.json({ success: true, interests });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        if (!body.receiverId) {
            return NextResponse.json({ error: 'receiverId is required' }, { status: 400 });
        }

        const interestRepo = new InterestRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();
        const auditLogRepo = new AuditLogRepositoryPrisma();
        const notificationRepo = new NotificationRepositoryPrisma();
        const useCase = new SendInterestUseCase(interestRepo, profileRepo, matchRepo, auditLogRepo, notificationRepo);

        const interest = await useCase.execute({
            senderId: session.userId,
            senderRole: session.role as any,
            receiverId: body.receiverId,
            message: body.message
        });

        return NextResponse.json({ success: true, interest });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
