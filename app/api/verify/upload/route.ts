import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { UploadIdentityDocumentUseCase } from '@/src/core/use-cases/UploadIdentityDocumentUseCase';
import { IdentityDocumentRepositoryPrisma } from '@/src/infrastructure/db/IdentityDocumentRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        if (!body.fileUrl || !body.type) {
            return NextResponse.json({ error: 'fileUrl and type are required' }, { status: 400 });
        }

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();
        const useCase = new UploadIdentityDocumentUseCase(docRepo, userRepo);

        const doc = await useCase.execute({
            userId: session.userId,
            type: body.type,
            fileUrl: body.fileUrl
        });

        return NextResponse.json({ success: true, document: doc.toJSON() });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
