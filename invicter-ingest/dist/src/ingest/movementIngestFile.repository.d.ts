import { TenantConnectionService } from '../database/tenant-connection.service';
import { MovementIngestFileEntity } from './entities/movementIngestFile.entity';
export declare class MovementIngestFileRepository {
    private readonly tenantConn;
    constructor(tenantConn: TenantConnectionService);
    createMany(data: MovementIngestFileEntity): Promise<any>;
    update(criteria: Partial<MovementIngestFileEntity>, dataToUpdate: Partial<MovementIngestFileEntity>): Promise<any[]>;
}
