
import { FavoriteRepository } from '../../core/interfaces/FavoriteRepository';
import { prisma } from './prismaClient';

export class FavoriteRepositoryPrisma implements FavoriteRepository {
    async toggle(userId: string, favoritedId: string): Promise<{ isFavorited: boolean }> {
        const existing = await (prisma as any).favorite.findUnique({
            where: {
                userId_favoritedId: { userId, favoritedId }
            }
        });

        if (existing) {
            await (prisma as any).favorite.delete({
                where: {
                    userId_favoritedId: { userId, favoritedId }
                }
            });
            return { isFavorited: false };
        } else {
            const created = await (prisma as any).favorite.create({
                data: { userId, favoritedId }
            });

            // Check for mutual resonance (Match)
            const mutual = await (prisma as any).favorite.findUnique({
                where: {
                    userId_favoritedId: { userId: favoritedId, favoritedId: userId }
                }
            });

            if (mutual) {
                // It's a match! Create a match record
                const existingMatch = await prisma.match.findFirst({
                    where: {
                        OR: [
                            { userAId: userId, userBId: favoritedId },
                            { userAId: favoritedId, userBId: userId }
                        ]
                    }
                });

                if (!existingMatch) {
                    await prisma.match.create({
                        data: {
                            userAId: userId,
                            userBId: favoritedId
                        }
                    });
                }
            }

            return { isFavorited: true };
        }
    }

    async isFavorited(userId: string, favoritedId: string): Promise<boolean> {
        const count = await (prisma as any).favorite.count({
            where: { userId, favoritedId }
        });
        return count > 0;
    }

    async getFavorites(userId: string): Promise<string[]> {
        const favorites = await (prisma as any).favorite.findMany({
            where: { userId },
            select: { favoritedId: true }
        });
        return favorites.map((f: { favoritedId: string }) => f.favoritedId);
    }
}
