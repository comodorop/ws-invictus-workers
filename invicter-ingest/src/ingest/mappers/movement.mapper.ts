import { Injectable } from '@nestjs/common';
import { CreateMovementDto } from '../dto/movement.dto';
import { MovementEntity } from '../entities/movement.entity';

@Injectable()
export class MovementMapper {
  dtoToEntity(
    dto: CreateMovementDto,
    sourceType: 'API' | 'FORM' | 'EXCEL',
    userId: string,
  ): MovementEntity {
    return {
      amount: dto.amount,
      date: dto.date,
      is_fiscal:
        typeof dto.isFiscal === 'string'
          ? dto.isFiscal.trim().toUpperCase() === 'SI'
          : (dto.isFiscal ?? true),
      description: dto.description || '',
      account_type: dto.accountType,
      currency: dto.currency,
      category_type: dto.categoryType,
      company_id: dto.companyId || '',
      accounting_code: dto.accountingCode,
      metadata: { ...dto.metadata, sourceType, userId },
    };
  }

  // Opcional: Para devolver datos al front en CamelCase
  entityToDto(entity: any) {
    return {
      id: entity.id,
      amount: Number(entity.amount),
      date: entity.date,
      isFiscal: entity.is_fiscal,
      description: entity.description,
      accountType: entity.account_type,
      currency: entity.currency,
      categoryType: entity.category_type,
      companyId: entity.company_id,
      accountingCode: entity.accounting_code,
      metadata:
        typeof entity.metadata === 'string'
          ? JSON.parse(entity.metadata)
          : entity.metadata,
    };
  }
}
