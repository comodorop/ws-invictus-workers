import { RmqContext } from '@nestjs/microservices';
import { AuditRepository } from './audit.repository';
import { AuditLogEntry } from './audit.types';
export declare class AuditConsumer {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: AuditRepository);
    handleAuditLog(payload: {
        pattern: string;
        data: AuditLogEntry;
    }, context: RmqContext): Promise<void>;
}
