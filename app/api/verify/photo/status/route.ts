import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const verification = await prisma.verification.findFirst({
            where: {
                userId: session.userId,
                documentType: 'PHOTO'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!verification) {
            return NextResponse.json({
                status: 'NOT_STARTED',
                hasProfilePhoto: false,
                hasSelfie: false,
                message: 'No photo verification found. Start by uploading a profile photo.'
            });
        }

        return NextResponse.json({
            status: verification.status,
            hasProfilePhoto: !!verification.documentUrl,
            hasSelfie: !!verification.selfieUrl,
            documentUrl: verification.documentUrl,
            selfieUrl: verification.selfieUrl,
            notes: verification.notes,
            createdAt: verification.createdAt,
            reviewedAt: verification.reviewedAt,
            message: verification.status === 'PENDING'
                ? 'Your verification is being reviewed by an admin'
                : verification.status === 'VERIFIED'
                    ? 'Your photo has been verified!'
                    : verification.notes || 'Verification rejected'
        });
    } catch (error: any) {
        console.error('Get verification status error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get verification status' },
            { status: 500 }
        );
    }
}
