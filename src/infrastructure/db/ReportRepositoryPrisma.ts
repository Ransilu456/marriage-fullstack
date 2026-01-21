import { prisma } from './prismaClient';

export class ReportRepositoryPrisma {
    async save(report: { reporterId: string, targetId: string, reason: string }): Promise<void> {
        await (prisma as any).report.create({
            data: {
                reporterId: report.reporterId,
                targetId: report.targetId,
                reason: report.reason
            }
        });
    }

    async findAllPending(): Promise<any[]> {
        return await (prisma as any).report.findMany({
            where: { status: 'OPEN' },
            include: {
                reporter: { select: { name: true, email: true } },
                target: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateStatus(reportId: string, status: string): Promise<void> {
        await (prisma as any).report.update({
            where: { id: reportId },
            data: { status }
        });
    }
}
