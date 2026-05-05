import { Injectable, Logger } from '@nestjs/common';
import { GcpStorageService } from '../utils/gcp.storage.service';
import { RabbitMQService } from '../utils/rabbitmq.service';
import { MovementIngestFileRepository } from './movementIngestFile.repository';

@Injectable()
export class IngestExcelService {
  private readonly logger = new Logger(IngestExcelService.name);

  constructor(
    private readonly gcpStorage: GcpStorageService,
    private readonly rabbitMQ: RabbitMQService,
    private readonly ingestFileRepository: MovementIngestFileRepository,
  ) {}

  async orchestrateIngestion(
    file: Express.Multer.File,
    user: any,
    companyId: string,
  ) {
    try {
      // Subir a GCP
      const fileId = await this.gcpStorage.upload(file);

      const message = {
        fileId,
        companyId: companyId,
        originalName: file.originalname,
        uuidUser: user.uuidUser,
        uuidTenant: user.plan === 'free' ? 'free' : user.uuidTenant,
        timestamp: new Date().toISOString(),
      };

      // Publicar en RabbitMQ
      await this.rabbitMQ.publish('excel_queue', message);

      await this.ingestFileRepository.createMany({
        company_id: companyId,
        file_id: fileId,
        file_name: file.originalname,
        uploaded_by: user.uuidUser,
        status: 'PENDING',
        created_at: new Date(),
      });

      this.logger.log(`Ingesta orquestada para company: ${companyId}`);

      return {
        success: true,
        fileId,
        message: 'Archivo en cola de procesamiento',
      };
    } catch (error) {
      this.logger.error(`Error orquestando ingesta: ${error.message}`);
      throw error;
    }
  }
}
