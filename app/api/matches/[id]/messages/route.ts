import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { MessageRepositoryPrisma } from '@/src/infrastructure/db/MessageRepositoryPrisma';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { SendMessageUseCase } from '@/src/core/use-cases/SendMessageUseCase';
import { UserRole } from '@/src/core/entities/User';
import { AuditLogRepositoryPrisma } from '@/src/infrastructure/db/AuditLogRepositoryPrisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const messageRepo = new MessageRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();

        // Verify user is part of match
        const match = await matchRepo.findById(id);
        if (!match || (match.userAId !== session.userId && match.userBId !== session.userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const messages = await messageRepo.findByMatchId(id);

        return NextResponse.json({ success: true, messages: messages.map(m => m.toJSON()) });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { content } = await request.json();

        const messageRepo = new MessageRepositoryPrisma();
        const matchRepo = new MatchRepositoryPrisma();
        const auditLogRepo = new AuditLogRepositoryPrisma();
        const useCase = new SendMessageUseCase(messageRepo, matchRepo, auditLogRepo);

        const message = await useCase.execute({
            matchId: id,
            senderId: session.userId,
            senderRole: session.role as any,
            content
        });

        return NextResponse.json({ success: true, message: message.toJSON() });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 400 }
        );
    }
}
