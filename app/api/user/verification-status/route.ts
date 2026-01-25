import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { GetUserVerificationStatus } from '@/src/core/use-cases/GetUserVerificationStatus';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const repo = new UserRepositoryPrisma();
        const useCase = new GetUserVerificationStatus(repo);
        const verification = await useCase.execute(session.userId);

        return NextResponse.json({
            success: true,
            verification
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
