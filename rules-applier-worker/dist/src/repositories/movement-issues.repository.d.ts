import { TenantConnectionService } from '../database/tenant-connection.service';
import { IssueEntity } from 'src/ruler/ruler.service';
export declare class MovementIssuesRepository {
    private readonly tenantConn;
    constructor(tenantConn: TenantConnectionService);
    createMany(entities: IssueEntity[]): Promise<{
        insertedIds: string[];
        errorCount: number;
    }>;
}
