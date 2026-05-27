import { TenantConnectionService } from '../database/tenant-connection.service';
import { AuditLogEntry } from './audit.types';
export declare class AuditRepository {
    private readonly tenantConn;
    constructor(tenantConn: TenantConnectionService);
    create(data: AuditLogEntry): Promise<any>;
}
