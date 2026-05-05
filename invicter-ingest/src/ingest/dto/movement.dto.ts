import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsObject,
  IsIn,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class RequestCreateMovementDto {
  movements: CreateMovementDto[];
}

export class CreateMovementDto {
  @IsUUID()
  companyId?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsBoolean()
  @IsOptional()
  isFiscal?: boolean | string; //En ingesta API y FORM llega un boolean pero por excel es SI o NO.

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['BANK', 'CASH'])
  accountType: string;

  @IsString()
  @MaxLength(3)
  currency: string;

  @IsString()
  @IsIn(['INCOME', 'EXPENSE'])
  categoryType: string;

  @IsString()
  accountingCode: string;

  @IsObject()
  metadata: {
    userId: string;
    sourceType: 'EXCEL' | 'API' | 'FORM';
    fileName?: string;
    transactionId?: string;
    reason?: string;
  };
}

export class MovementDto extends CreateMovementDto {
  id: string;
}

export class MovementFilterDto {
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() accountType?: string;
  @IsOptional() @IsString() categoryType?: string;
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      if (value.toUpperCase() === 'SI') return true;
      if (value.toUpperCase() === 'NO') return false;
    }
    return value;
  })
  @IsBoolean()
  isFiscal?: boolean | string;

  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() sortBy?: string; // Ejemplo: 'amount', 'date', 'description'
  @IsOptional() @IsIn(['asc', 'desc', 'ASC', 'DESC']) sortOrder?:
    | 'asc'
    | 'desc'
    | 'ASC'
    | 'DESC';

  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}

export class StatsFilterDto {
  @IsDateString()
  startDate?: string;
  @IsDateString()
  endDate?: string;
}
