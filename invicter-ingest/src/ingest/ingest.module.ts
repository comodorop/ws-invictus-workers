import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestExcelService } from './ingest-excel.service';
import { GcpStorageService } from '../utils/gcp.storage.service';
import { RabbitMQService } from '../utils/rabbitmq.service';
import { IngestService } from './ingest.service';
import { IngestRepository } from './movement.repository';
import { MovementMapper } from './mappers/movement.mapper';
import { IngestExcelConsumer } from './worker/ingest-excel.consumer';
import { MovementIngestFileRepository } from './movementIngestFile.repository';

@Module({
  controllers: [IngestController, IngestExcelConsumer],
  providers: [
    IngestExcelService,
    IngestService,
    GcpStorageService,
    RabbitMQService,
    IngestRepository,
    MovementIngestFileRepository,
    MovementMapper,
  ],
})
export class IngestModule {}
