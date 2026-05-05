import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    register(dto: CreateTenantDto): Promise<import("../database/tenant-connection.service").TenantRecord>;
    findAll(): Promise<Omit<import("../database/tenant-connection.service").TenantRecord, "schema" | "db_password">[]>;
    migrate(id: string): Promise<{
        applied: string[];
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
