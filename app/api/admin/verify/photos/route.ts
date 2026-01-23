import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Get total count
        const total = await prisma.verification.count({
            where: {
                documentType: 'PHOTO',
                status: status as any
            }
        });

        // Get verifications with user details
        const verifications = await prisma.verification.findMany({
            where: {
                documentType: 'PHOTO',
                status: status as any
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoVerified: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            verifications: verifications.map(v => ({
                id: v.id,
                userId: v.userId,
                userName: v.user.name || 'Unknown',
                userEmail: v.user.email,
                documentUrl: v.documentUrl,
                selfieUrl: v.selfieUrl,
                status: v.status,
                notes: v.notes,
                createdAt: v.createdAt,
                reviewedAt: v.reviewedAt,
                reviewedBy: v.reviewedBy
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error: any) {
        console.error('Get verifications error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get verifications' },
            { status: 500 }
        );
    }
}
