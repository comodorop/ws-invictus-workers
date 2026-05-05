import { IsUUID, IsObject, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateMovementIngestErrorDto {
  @IsUUID()
  companyId: string;

  @IsObject()
  rawPayload: any;

  @IsOptional()
  @IsObject()
  errorType?: any; // jsonb (array de errores)

  @IsOptional()
  @IsString()
  dbErrorMessage?: string;

  @IsOptional()
  @IsIn(['PENDING', 'RESOLVED', 'IGNORED'])
  status?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class MovementIngestErrorDto {
  id: string;

  companyId: string;

  rawPayload: any;

  errorType?: any;

  dbErrorMessage?: string;

  status: 'PENDING' | 'RESOLVED' | 'IGNORED';

  fileName?: string;

  createdAt: Date;
}

export class MovementIngestErrorFilterDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsIn(['PENDING', 'RESOLVED', 'IGNORED'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
