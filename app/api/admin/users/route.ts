
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
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Note: UserRepositoryPrisma might not have a generic 'findAll' with interactions.
        // We'll use PrismaClient directly for admin dashboard queries to avoid over-fetching entities if not needed,
        // or extend the repository. For simplicity/directness in Admin API, direct prisma or extended repo is common.
        // Let's assume we can use the repository or valid abstraction.
        // Checking UserRepositoryPrisma... we haven't seen it all.
        // Let's use a direct prisma instance for admin "list all" which is often outside domain aggregates.

        // const prisma = new PrismaClient(); // Removed

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    accountStatus: true,
                    createdAt: true,
                    trustScore: true,
                    reportsReceived: {
                        select: { id: true }
                    }
                }
            }),
            prisma.user.count()
        ]);

        // Transform for dashboard
        const dashboardUsers = users.map(user => ({
            ...user,
            reportCount: user.reportsReceived.length
        }));

        return NextResponse.json({
            success: true,
            users: dashboardUsers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
