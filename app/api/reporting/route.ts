import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { ReportRepositoryPrisma } from '@/src/infrastructure/db/ReportRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetId, reason } = await request.json();
        const reportRepo = new ReportRepositoryPrisma();

        await reportRepo.save({
            reporterId: session.userId,
            targetId,
            reason
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
