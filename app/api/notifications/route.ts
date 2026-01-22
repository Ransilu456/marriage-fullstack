import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const notifications = await prisma.notification.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.userId,
                read: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (body.markAllAsRead) {
            await prisma.notification.updateMany({
                where: { userId: session.userId, read: false },
                data: { read: true }
            });
        } else if (body.notificationId) {
            await prisma.notification.update({
                where: { id: body.notificationId, userId: session.userId },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (body.notificationId) {
            await prisma.notification.delete({
                where: { id: body.notificationId, userId: session.userId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
