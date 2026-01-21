import { NextResponse } from 'next/server';
import { LinkGuardianUseCase } from '@/src/core/use-cases/LinkGuardianUseCase';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { getSession } from '@/src/lib/auth';

const userRepo = new UserRepositoryPrisma();
const linkGuardianUseCase = new LinkGuardianUseCase(userRepo);

export async function POST(req: Request) {
    const payload = await getSession();
    // Since we don't have verifyAuth exports, let's check its location
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    try {
        const { guardianEmail } = await req.json();
        if (!guardianEmail) return NextResponse.json({ success: false, error: 'Guardian email is required' }, { status: 400 });

        await linkGuardianUseCase.execute({
            chargeId: payload.userId,
            guardianEmail
        });

        return NextResponse.json({ success: true, message: 'Guardian link established successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
