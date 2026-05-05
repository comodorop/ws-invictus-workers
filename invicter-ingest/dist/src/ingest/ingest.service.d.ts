import { IngestRepository } from './movement.repository';
import { MovementMapper } from './mappers/movement.mapper';
import { CreateMovementDto, MovementFilterDto, StatsFilterDto } from './dto/movement.dto';
export declare class IngestService {
    private readonly repository;
    private readonly mapper;
    private readonly logger;
    constructor(repository: IngestRepository, mapper: MovementMapper);
    createDirectEntry(request: CreateMovementDto[], source: 'API' | 'FORM' | 'EXCEL', user: string, companyId: string): Promise<{
        summary: {
            totalProcessed: number;
            successCount: number;
            errorCount: number;
        };
        insertedIds: string[];
        errors: string | never[];
    } | {
        summary: {
            totalProcessed: number;
            successCount: number;
            errorCount: number;
        };
        insertedIds: never[];
        errors: {
            message: string;
            detail: any;
        }[];
    }>;
    getMovements(filters: MovementFilterDto, companyId: string): Promise<{
        cashFlow: any;
        liquidity: any;
        topExpenses: any;
        fiscalRatio: any;
        period: {
            start: string;
            end: string;
        };
        data: any[];
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    }>;
    removeEntry(id: string): Promise<number>;
    getDashboard(filters: MovementFilterDto | StatsFilterDto, companyId: string): Promise<{
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
