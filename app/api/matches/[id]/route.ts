import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // A match is an accepted proposal
        const match = await prisma.proposal.findUnique({
            where: { id },
            include: {
                proposer: {
                    select: {
                        id: true,
                        name: true,
                        profile: {
                            select: {
                                photoUrl: true,
                                location: true
                            }
                        }
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        name: true,
                        profile: {
                            select: {
                                photoUrl: true,
                                location: true
                            }
                        }
                    }
                }
            }
        });

        if (!match || match.answer !== 'YES') {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Check if user is part of the match
        if (match.proposerId !== session.userId && match.recipientId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Map to return userA and userB for consistency in frontend
        const result = {
            id: match.id,
            userAId: match.proposerId,
            userBId: match.recipientId,
            userA: match.proposer,
            userB: match.recipient,
            adminNotified: (match as any).adminNotified || false, // Assuming a field or logic
            createdAt: match.createdAt
        };

        return NextResponse.json({ success: true, match: result });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
