import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { SendMessageUseCase } from '@/src/core/use-cases/SendMessageUseCase';
import { AuditLogRepositoryPrisma } from '@/src/infrastructure/db/AuditLogRepositoryPrisma';

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
        const repo = new MessageRepositoryPrisma();
        const messages = await repo.getConversation(session.userId, userId);

        return NextResponse.json({ success: true, messages });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const messageRepo = new MessageRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();
        const auditLogRepo = new AuditLogRepositoryPrisma();

        // Find existing match
        const match = await matchRepo.findByUsers(session.userId, userId);
        if (!match) {
            return NextResponse.json({ error: 'No active match found between these users' }, { status: 403 });
        }

        const useCase = new SendMessageUseCase(messageRepo, matchRepo, auditLogRepo);
        const message = await useCase.execute({
            matchId: match.id,
            senderId: session.userId,
            senderRole: session.role as any,
            content
        });

        return NextResponse.json({ success: true, message });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
