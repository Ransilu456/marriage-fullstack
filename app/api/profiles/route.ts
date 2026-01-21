import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { SearchProfilesUseCase } from '@/src/core/use-cases/SearchProfilesUseCase';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { BlockRepositoryPrisma } from '@/src/infrastructure/db/BlockRepositoryPrisma';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const repo = new ProfileRepositoryPrisma();
        const blockRepo = new BlockRepositoryPrisma();
        const useCase = new SearchProfilesUseCase(repo, blockRepo);

        const profiles = await useCase.execute({
            userId: session.userId,
            minAge: searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined,
            maxAge: searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined,
            religion: searchParams.get('religion') || undefined,
            gender: searchParams.get('gender') || undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
            limit: 20
        });

        return NextResponse.json({ success: true, profiles });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
