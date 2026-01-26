import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { SubmitAnswerUseCase } from '@/src/core/use-cases/SubmitAnswer';
import { ProposalRepositoryPrisma } from '@/src/infrastructure/db/ProposalRepositoryPrisma';
import { NotificationRepositoryPrisma } from '@/src/infrastructure/db/NotificationRepositoryPrisma';
import { getEmailService } from '@/src/infrastructure/email/EmailService';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { answer, message } = await request.json();

        if (!answer || !['YES', 'NO'].includes(answer)) {
            return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
        }

        const proposalRepo = new ProposalRepositoryPrisma();
        const notificationRepo = new NotificationRepositoryPrisma();
        const emailService = getEmailService();
        const useCase = new SubmitAnswerUseCase(proposalRepo, emailService, notificationRepo);

        const result = await useCase.execute({
            proposalId: id,
            answer,
            message
        });

        return NextResponse.json({
            success: true,
            proposal: result.proposal,
            emailSent: result.emailSent
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
