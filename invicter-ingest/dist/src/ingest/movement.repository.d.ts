import { TenantConnectionService } from '../database/tenant-connection.service';
import { MovementEntity } from './entities/movement.entity';
import { MovementFilterDto } from './dto/movement.dto';
export declare class IngestRepository {
    private readonly tenantConn;
    constructor(tenantConn: TenantConnectionService);
    create(entity: MovementEntity): Promise<any>;
    createMany(entities: MovementEntity[], fileName?: string): Promise<{
        insertedIds: string[];
        errorCount: number;
    }>;
    findAll(filters: MovementFilterDto, companyId: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    }>;
    delete(id: string): Promise<number>;
    getDashboardStats(companyId: string, startDate?: string, endDate?: string): Promise<{
        cashFlow: any;
        liquidity: any;
        topExpenses: any;
        fiscalRatio: any;
        period: {
            start: string;
            end: string;
        };
    }>;
}
