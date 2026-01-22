import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        const repo = new ProfileRepositoryPrisma();
        const profile = await repo.findByUserId(userId);

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
