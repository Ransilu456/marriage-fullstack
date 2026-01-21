import { NextResponse } from 'next/server';
import { getSession } from '../../../../src/lib/auth';
import { IdentityDocumentRepositoryPrisma } from '../../../../src/infrastructure/db/IdentityDocumentRepositoryPrisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const docRepo = new IdentityDocumentRepositoryPrisma();
        const docs = await docRepo.findByUserId(session.userId);

        return NextResponse.json({
            success: true,
            documents: docs.map(d => d.toJSON())
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
