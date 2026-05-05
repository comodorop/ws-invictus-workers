import { TenantConnectionService, TenantRecord } from '../database/tenant-connection.service';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsService {
    private readonly tenantConn;
    private readonly tenantsRepo;
    constructor(tenantConn: TenantConnectionService, tenantsRepo: TenantsRepository);
    register(dto: CreateTenantDto): Promise<TenantRecord>;
    findAll(): Promise<Omit<TenantRecord, 'schema' | 'db_password'>[]>;
    migrate(tenantId: string): Promise<{
        applied: string[];
    }>;
    remove(tenantId: string): Promise<{
        deleted: boolean;
    }>;
}
