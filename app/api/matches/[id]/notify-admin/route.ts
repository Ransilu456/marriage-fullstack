import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { NotificationRepositoryPrisma } from '@/src/infrastructure/db/NotificationRepositoryPrisma';

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

        const match = await prisma.proposal.findUnique({
            where: { id },
            include: {
                proposer: true,
                recipient: true
            }
        });

        if (!match || match.answer !== 'YES') {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Update match status
        await prisma.proposal.update({
            where: { id },
            data: { adminNotified: true }
        });

        // Notify Admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        const notificationRepo = new NotificationRepositoryPrisma();

        for (const admin of admins) {
            await notificationRepo.save({
                userId: admin.id,
                type: 'MATCH_REPORTED',
                title: 'New Match Reported! 💍',
                message: `Users ${match.proposer.name} and ${match.recipient.name} have successfully matched and reported it.`,
                link: `/admin/proposals/${match.id}`
            });
        }

        return NextResponse.json({ success: true, message: 'Administrators have been notified. Congratulations!' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
