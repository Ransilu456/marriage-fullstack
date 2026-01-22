import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { UpsertProfileUseCase } from '@/src/core/use-cases/UpsertProfileUseCase';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { AuditLogRepositoryPrisma } from '@/src/infrastructure/db/AuditLogRepositoryPrisma';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const repo = new ProfileRepositoryPrisma();
        const profile = await repo.findByUserId(session.userId);

        return NextResponse.json({
            success: true,
            profile: profile?.toJSON(),
            user: {
                id: session.userId,
                email: session.email,
                role: session.role
            }
        });
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
        const repo = new ProfileRepositoryPrisma();
        const auditLogRepo = new AuditLogRepositoryPrisma();
        const useCase = new UpsertProfileUseCase(repo, auditLogRepo);

        const profile = await useCase.execute({
            userId: session.userId,
            name: session.name,
            ...body
        });

        return NextResponse.json({ success: true, profile: profile.toJSON() });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
