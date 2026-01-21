import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { FavoriteRepositoryPrisma } from '@/src/infrastructure/db/FavoriteRepositoryPrisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const repo = new FavoriteRepositoryPrisma();
        const favoriteIds = await repo.getFavorites(session.userId);

        return NextResponse.json({ success: true, favoriteIds });
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

        const { favoritedId } = await request.json();
        if (!favoritedId) {
            return NextResponse.json({ error: 'favoritedId is required' }, { status: 400 });
        }

        const repo = new FavoriteRepositoryPrisma();
        const result = await repo.toggle(session.userId, favoritedId);

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
