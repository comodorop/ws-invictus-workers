import { TenantConnectionService, TenantRecord } from '../database/tenant-connection.service';
export declare class TenantsRepository {
    private readonly tenantConn;
    constructor(tenantConn: TenantConnectionService);
    findAll(): Promise<Omit<TenantRecord, 'schema' | 'db_password'>[]>;
}
