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
        const body = await request.json();
        const { reason } = body;

        if (!reason || reason.trim().length === 0) {
            return NextResponse.json({
                error: 'Rejection reason is required'
            }, { status: 400 });
        }

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
                status: 'REJECTED',
                reviewedBy: session.userId,
                reviewedAt: new Date(),
                notes: reason
            }
        });

        // Send notification to user
        await prisma.notification.create({
            data: {
                userId: verification.userId,
                type: 'VERIFICATION_REJECTED',
                title: 'Photo Verification Rejected',
                message: `Your photo verification was rejected. Reason: ${reason}`,
                link: '/verify/photo'
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: 'REJECT_PHOTO_VERIFICATION',
                resource: `verification:${id}`,
                metadata: JSON.stringify({
                    verificationId: id,
                    targetUserId: verification.userId,
                    reason
                })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Photo verification rejected successfully'
        });
    } catch (error: any) {
        console.error('Reject verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reject verification' },
            { status: 500 }
        );
    }
}
