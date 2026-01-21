
import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
    save(log: AuditLog): Promise<void>;
    findByUser(userId: string): Promise<AuditLog[]>;
}
