
import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, message, type } = await request.json(); // type: 'WARNING', 'INFO', 'SYSTEM'

        if (!userId || !message) {
            return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
        }

        // const prisma = new PrismaClient(); // Removed

        // Create a notification for the user
        // We assume 'Notification' model exists as per schema
        const notification = await prisma.notification.create({
            data: {
                userId,
                type: type || 'SYSTEM',
                title: 'Admin Feedback',
                message,
                read: false,
                createdAt: new Date()
            }
        });

        return NextResponse.json({ success: true, notification });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
