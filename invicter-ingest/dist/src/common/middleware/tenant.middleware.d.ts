import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantConnectionService } from '../../database/tenant-connection.service';
export interface TenantRequest extends Request {
    tenantId: string;
}
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantService;
    constructor(tenantService: TenantConnectionService);
    use(req: TenantRequest, _res: Response, next: NextFunction): Promise<void>;
}
