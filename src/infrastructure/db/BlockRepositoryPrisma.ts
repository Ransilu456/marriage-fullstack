import { prisma } from './prismaClient';

export class BlockRepositoryPrisma {
    async save(blockerId: string, targetId: string): Promise<void> {
        await prisma.block.upsert({
            where: {
                blockerId_targetId: { blockerId, targetId }
            },
            update: {},
            create: { blockerId, targetId }
        });
    }

    async isBlocked(blockerId: string, targetId: string): Promise<boolean> {
        const block = await prisma.block.findUnique({
            where: {
                blockerId_targetId: { blockerId, targetId }
            }
        });
        return !!block;
    }

    async findAllBlockedByUser(userId: string): Promise<string[]> {
        const blocks = await prisma.block.findMany({
            where: { blockerId: userId },
            select: { targetId: true }
        });
        return blocks.map(b => b.targetId);
    }

    async findAllWhoBlockedUser(userId: string): Promise<string[]> {
        const blocks = await prisma.block.findMany({
            where: { targetId: userId },
            select: { blockerId: true }
        });
        return blocks.map(b => b.blockerId);
    }

    async unblock(blockerId: string, targetId: string): Promise<void> {
        await prisma.block.delete({
            where: {
                blockerId_targetId: { blockerId, targetId }
            }
        });
    }
}
