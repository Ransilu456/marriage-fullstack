import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const verification = await prisma.verification.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!verification) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        if (verification.documentType !== 'PHOTO') {
            return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
        }

        if (verification.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Verification already processed'
            }, { status: 400 });
        }

        // Update verification status
        await prisma.verification.update({
            where: { id },
            data: {
                status: 'VERIFIED',
                reviewedBy: session.userId,
                reviewedAt: new Date(),
                notes: 'Photo verified by admin'
            }
        });

        // Update user's photoVerified status
        const currentTrustScore = verification.user.trustScore;
        const newTrustScore = verification.user.photoVerified
            ? currentTrustScore
            : currentTrustScore + 30; // +30 points for photo verification

        await prisma.user.update({
            where: { id: verification.userId },
            data: {
                photoVerified: true,
                trustScore: newTrustScore,
                accountStatus: newTrustScore >= 50 ? 'VERIFIED' : 'LIMITED'
            }
        });

        // Send notification to user
        await prisma.notification.create({
            data: {
                userId: verification.userId,
                type: 'VERIFICATION_APPROVED',
                title: 'Photo Verified! 🎉',
                message: 'Your photo has been verified. Your trust score increased by 30 points!',
                link: '/profile'
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: 'APPROVE_PHOTO_VERIFICATION',
                resource: `verification:${id}`,
                metadata: JSON.stringify({
                    verificationId: id,
                    targetUserId: verification.userId,
                    newTrustScore
                })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Photo verification approved successfully',
            newTrustScore
        });
    } catch (error: any) {
        console.error('Approve verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve verification' },
            { status: 500 }
        );
    }
}
