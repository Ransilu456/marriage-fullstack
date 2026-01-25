import { NextResponse } from 'next/server';
import { getSession } from '../../../../src/lib/auth';
import { IdentityDocumentRepositoryPrisma } from '../../../../src/infrastructure/db/IdentityDocumentRepositoryPrisma';
import { GetIdentityDocuments } from '../../../../src/core/use-cases/GetIdentityDocuments';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const useCase = new GetIdentityDocuments(docRepo);
        const docs = await useCase.execute(session.userId);

        return NextResponse.json({
            success: true,
            documents: docs
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
