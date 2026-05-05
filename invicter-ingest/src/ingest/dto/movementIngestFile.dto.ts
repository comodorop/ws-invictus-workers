import { IsUUID, IsString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateMovementIngestFileDto {
  @IsUUID()
  companyId: string;

  @IsString()
  fileId: string;

  @IsString()
  fileName: string;

  @IsUUID()
  @IsOptional()
  uploadedBy?: string;

  @IsOptional()
  @IsIn([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'COMPLETED_WITH_ERRORS',
    'FAILED',
  ])
  status?: string;
}

export class MovementIngestFileDto {
  id?: string;
  companyId: string;
  fileId: string;
  fileName: string;
  uploadedBy?: string;

  status:
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'COMPLETED_WITH_ERRORS'
    | 'FAILED';

  totalRecords: number;
  successRecords: number;
  errorRecords: number;

  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class MovementIngestFileFilterDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsIn([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'COMPLETED_WITH_ERRORS',
    'FAILED',
  ])
  status?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
