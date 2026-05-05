import { RmqContext } from '@nestjs/microservices';
import { GcpStorageService } from '../../utils/gcp.storage.service';
import { IngestRepository } from '../movement.repository';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementIngestFileRepository } from '../movementIngestFile.repository';
export declare class IngestExcelConsumer {
    private readonly gcpStorage;
    private readonly repository;
    private readonly mapper;
    private readonly ingestFileRepository;
    private readonly logger;
    constructor(gcpStorage: GcpStorageService, repository: IngestRepository, mapper: MovementMapper, ingestFileRepository: MovementIngestFileRepository);
    processExcel(data: any, context: RmqContext): Promise<void>;
}
