import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { MatchRepositoryPrisma } from '@/src/infrastructure/db/MatchRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const matchRepo = new MatchRepositoryPrisma();
        const profileRepo = new ProfileRepositoryPrisma();
        const userRepo = new UserRepositoryPrisma();

        const matches = await matchRepo.findAllForUser(session.userId);

        const enrichedMatches = await Promise.all(matches.map(async (match) => {
            const partnerId = match.userAId === session.userId ? match.userBId : match.userAId;
            const partnerProfile = await profileRepo.findByUserId(partnerId);
            const partnerUser = await userRepo.findById(partnerId);

            return {
                id: match.id,
                partnerId,
                partnerName: partnerUser?.name || 'Anonymous',
                partnerPhoto: partnerProfile?.toJSON().photoUrl,
                createdAt: match.createdAt
            };
        }));

        return NextResponse.json({ success: true, matches: enrichedMatches });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
