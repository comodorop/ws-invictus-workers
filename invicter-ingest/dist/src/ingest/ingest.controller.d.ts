import { IngestExcelService } from './ingest-excel.service';
import { IngestService } from './ingest.service';
import { CreateMovementDto, MovementFilterDto, StatsFilterDto } from './dto/movement.dto';
export declare class IngestController {
    private readonly ingestExcelService;
    private readonly ingestService;
    constructor(ingestExcelService: IngestExcelService, ingestService: IngestService);
    upload(id: string, file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        fileId: string;
        message: string;
    }>;
    fromApi(id: string, data: CreateMovementDto[], req: any): Promise<{
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
    fromForm(id: string, data: any, req: any): Promise<{
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
    getMovements(id: string, filters: MovementFilterDto): Promise<{
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
    deleteMovement(uuid: string): Promise<number>;
    getStats(id: string, filters: StatsFilterDto): Promise<{
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
