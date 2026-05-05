import { Injectable } from '@nestjs/common';
import { MovementIngestFileEntity } from '../entities/movementIngestFile.entity';
import { MovementIngestFileDto } from '../dto/movementIngestFile.dto';

@Injectable()
export class MovementIngestFileMapper {
  toDto(entity: MovementIngestFileEntity): MovementIngestFileDto {
    return {
      id: entity.id,
      companyId: entity.company_id,
      fileId: entity.file_id,
      fileName: entity.file_name,
      uploadedBy: entity.uploaded_by,

      status: entity.status,

      totalRecords: entity.total_records || 0,
      successRecords: entity.success_records || 0,
      errorRecords: entity.error_records || 0,

      createdAt: entity.created_at,
      startedAt: entity.started_at,
      completedAt: entity.completed_at,
    };
  }

  toEntity(dto: MovementIngestFileDto): MovementIngestFileEntity {
    return {
      id: dto.id,

      company_id: dto.companyId,

      file_id: dto.fileId,
      file_name: dto.fileName,

      uploaded_by: dto.uploadedBy,

      status: dto.status,

      total_records: dto.totalRecords,
      success_records: dto.successRecords,
      error_records: dto.errorRecords,

      created_at: dto.createdAt,
      started_at: dto.startedAt,
      completed_at: dto.completedAt,
    };
  }
}
