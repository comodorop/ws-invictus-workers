import { GcpStorageService } from '../utils/gcp.storage.service';
import { RabbitMQService } from '../utils/rabbitmq.service';
import { MovementIngestFileRepository } from './movementIngestFile.repository';
export declare class IngestExcelService {
    private readonly gcpStorage;
    private readonly rabbitMQ;
    private readonly ingestFileRepository;
    private readonly logger;
    constructor(gcpStorage: GcpStorageService, rabbitMQ: RabbitMQService, ingestFileRepository: MovementIngestFileRepository);
    orchestrateIngestion(file: Express.Multer.File, user: any, companyId: string): Promise<{
        success: boolean;
        fileId: string;
        message: string;
    }>;
}
