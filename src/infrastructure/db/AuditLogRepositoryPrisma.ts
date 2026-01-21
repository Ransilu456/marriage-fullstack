
import { IAuditLogRepository } from '../../core/interfaces/IAuditLogRepository';
import { AuditLog } from '../../core/entities/AuditLog';
import { prisma } from './prismaClient';

export class AuditLogRepositoryPrisma implements IAuditLogRepository {
    async save(log: AuditLog): Promise<void> {
        await (prisma as any).auditLog.create({
            data: {
                id: log.id,
                userId: log.userId,
                action: log.action,
                resource: log.resource,
                metadata: log.metadata,
                createdAt: log.createdAt
            }
        });
    }

    async findByUser(userId: string): Promise<AuditLog[]> {
        const logs = await (prisma as any).auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return logs.map((l: any) => new AuditLog({
            id: l.id,
            userId: l.userId,
            action: l.action,
            resource: l.resource,
            metadata: l.metadata,
            createdAt: l.createdAt
        }));
    }
}
