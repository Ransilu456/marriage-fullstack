import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { BlockRepositoryPrisma } from '@/src/infrastructure/db/BlockRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetId, action } = await request.json(); // action: 'block' or 'unblock'
        const blockRepo = new BlockRepositoryPrisma();

        if (action === 'block') {
            await blockRepo.save(session.userId, targetId);
        } else {
            await blockRepo.unblock(session.userId, targetId);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
