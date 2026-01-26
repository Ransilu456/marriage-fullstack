import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { GenerateEmailVerificationTokenUseCase } from '@/src/core/use-cases/GenerateEmailVerificationToken';
import { VerifyEmailUseCase } from '@/src/core/use-cases/VerifyEmail';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { getEmailService } from '@/src/infrastructure/email/EmailService';
import { NotificationRepositoryPrisma } from '@/src/infrastructure/db/NotificationRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRepo = new UserRepositoryPrisma();
        const emailService = getEmailService();
        const notificationRepo = new NotificationRepositoryPrisma();
        const useCase = new GenerateEmailVerificationTokenUseCase(userRepo, emailService, notificationRepo);

        await useCase.execute(session.userId);

        return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { otp } = await request.json();
        if (!otp) {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
        }

        const userRepo = new UserRepositoryPrisma();
        const notificationRepo = new NotificationRepositoryPrisma();
        const useCase = new VerifyEmailUseCase(userRepo, notificationRepo);

        await useCase.execute(session.userId, otp);

        return NextResponse.json({ success: true, message: 'Email verified successfully! +20 points awarded.' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
