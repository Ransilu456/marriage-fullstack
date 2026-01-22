import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user and their relations
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                managedBy: {
                    select: { id: true, name: true, email: true }
                },
                managing: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            managedBy: user.managedBy,
            manages: user.managing
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { guardianEmail } = body;

        if (!guardianEmail) {
            return NextResponse.json({ error: 'Guardian email required' }, { status: 400 });
        }

        // Find potential guardian
        const guardian = await prisma.user.findUnique({
            where: { email: guardianEmail }
        });

        if (!guardian) {
            return NextResponse.json({ error: 'Guardian user not found' }, { status: 404 });
        }

        if (guardian.id === session.userId) {
            return NextResponse.json({ error: 'Cannot link yourself as guardian' }, { status: 400 });
        }

        // Update user to be managed by guardian
        await prisma.user.update({
            where: { id: session.userId },
            data: { managedById: guardian.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Guardian linked successfully'
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
