import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { VerifyIdentityDocumentUseCase } from '@/src/core/use-cases/VerifyIdentityDocumentUseCase';
import { IdentityDocumentRepositoryPrisma } from '@/src/infrastructure/db/IdentityDocumentRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        if (!body.documentId || !body.action) {
            return NextResponse.json({ error: 'documentId and action are required' }, { status: 400 });
        }

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();
        const useCase = new VerifyIdentityDocumentUseCase(docRepo, userRepo);

        await useCase.execute({
            adminId: session.userId,
            documentId: body.documentId,
            action: body.action as 'VERIFY' | 'REJECT',
            reason: body.reason
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const pending = await docRepo.findAllPending();

        return NextResponse.json({
            success: true,
            verifications: pending.map(d => ({
                ...d.toJSON(),
                userName: (d as any).user?.name,
                userEmail: (d as any).user?.email
            }))
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
