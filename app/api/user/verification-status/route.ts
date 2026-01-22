import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                emailVerified: true,
                phoneVerified: true,
                photoVerified: true,
                idVerified: true,
                trustScore: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            verification: {
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                photoVerified: user.photoVerified,
                idVerified: user.idVerified,
                trustScore: user.trustScore
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
