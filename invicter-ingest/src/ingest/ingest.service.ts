// src/ingest/ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { IngestRepository } from './movement.repository';
import { MovementMapper } from './mappers/movement.mapper';
import {
  CreateMovementDto,
  MovementFilterDto,
  StatsFilterDto,
} from './dto/movement.dto';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly repository: IngestRepository,
    private readonly mapper: MovementMapper,
  ) {}

  // async createDirectEntry(
  //   request: CreateMovementDto[],
  //   source: 'API' | 'FORM' | 'EXCEL',
  //   user: string,
  //   companyId: string,
  // ) {
  //   const dataMapped = request.map((movement) =>
  //     this.mapper.dtoToEntity({ companyId, ...movement }, source, user),
  //   );

  //   try {
  //     const result = await this.repository.createMany(dataMapped);

  //     return {
  //       summary: {
  //         totalProcessed: request.length,
  //         successCount: result.insertedIds.length,
  //         errorCount: result.errorCount,
  //       },
  //       insertedIds: result.insertedIds.map((r: any) => r.id),
  //       errors:
  //         result.errorCount > 0 ? 'Revisar tabla de errores de ingesta' : [],
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error en Batch Insert: ${error.message}`);

  //     return {
  //       summary: {
  //         totalProcessed: request.length,
  //         successCount: 0,
  //         errorCount: request.length,
  //       },
  //       insertedIds: [],
  //       errors: [
  //         {
  //           message: 'Error al procesar el lote completo',
  //           detail: error.message,
  //         },
  //       ],
  //     };
  //   }
  // }

  async createDirectEntry(
    request: CreateMovementDto[],
    source: 'API' | 'FORM' | 'EXCEL',
    user: string,
    companyId: string,
  ) {
    const db = await this.repository['tenantConn'].getConnection('free'); // Ajuste 0: asegúrate de tener db

    // Ajuste 1: catálogos en memoria
    const VALID_CURRENCIES = new Set(['MXN', 'USD', 'EUR']);
    const VALID_ACCOUNT_TYPES = new Set(['BANK', 'CASH']);
    const VALID_CATEGORY_TYPES = new Set(['INCOME', 'EXPENSE']);

    // Ajuste 2: precargar accounting codes (1 sola query)
    const accountingCodesFromDB = await db('accounting_catalog').select('code');
    const VALID_ACCOUNTING_CODES = new Set(
      accountingCodesFromDB.map((c) => c.code),
    );

    // Ajuste 3: usar request (no entities)
    const { validEntities, invalidEntities } = request.reduce(
      (acc, e: CreateMovementDto) => {
        const errors: string[] = [];

        // amount
        if (isNaN(e.amount)) {
          errors.push('INVALID_AMOUNT');
        }

        // date
        if (!e.date) {
          errors.push('MISSING_DATE');
        }

        // currency
        if (!VALID_CURRENCIES.has(e.currency)) {
          errors.push('INVALID_CURRENCY');
        }

        // accountType
        if (!VALID_ACCOUNT_TYPES.has(e.accountType)) {
          errors.push('INVALID_ACCOUNT_TYPE');
        }

        // categoryType
        if (!VALID_CATEGORY_TYPES.has(e.categoryType)) {
          errors.push('INVALID_CATEGORY_TYPE');
        }

        // Ajuste 4: VALIDAR + NORMALIZAR isFiscal correctamente
        let normalizedIsFiscal: boolean | string = ''; //Si le ponemos | null tendremos un problema de tipado.

        if (typeof e.isFiscal === 'string') {
          const value = e.isFiscal.trim().toUpperCase();

          if (value === 'SI') normalizedIsFiscal = true;
          else if (value === 'NO') normalizedIsFiscal = false;
          else errors.push('INVALID_FISCAL');
        } else if (typeof e.isFiscal === 'boolean') {
          normalizedIsFiscal = e.isFiscal;
        } else {
          errors.push('INVALID_FISCAL');
        }

        // accountingCode
        if (!VALID_ACCOUNTING_CODES.has(e.accountingCode)) {
          errors.push('INVALID_ACCOUNTING_CODE');
        }

        // Clasificación final
        if (errors.length === 0) {
          acc.validEntities.push({
            ...e,
            isFiscal: normalizedIsFiscal,
          });
        } else {
          acc.invalidEntities.push({
            entity: e,
            errors,
          });
        }

        return acc;
      },
      {
        validEntities: [] as CreateMovementDto[],
        invalidEntities: [] as {
          entity: any;
          errors: string[];
        }[],
      },
    );

    // Ajuste 5: guardar errores (usar companyId correcto)
    if (invalidEntities.length) {
      await db('movement_ingest_errors').insert(
        invalidEntities.map((e) => ({
          company_id: companyId,
          raw_payload: e.entity,
          error_type: JSON.stringify(e.errors),
          db_error_message: null,
          status: 'PENDING',
        })),
      );
    }

    // Ajuste 6: SOLO usar validEntities (no request)
    const dataMapped = validEntities.map((movement) =>
      this.mapper.dtoToEntity({ companyId, ...movement }, source, user),
    );

    try {
      const result = await this.repository.createMany(dataMapped);

      return {
        summary: {
          totalProcessed: request.length, // total original
          successCount: result.insertedIds.length,
          errorCount: invalidEntities.length + result.errorCount, // incluye errores de validación + DB
        },
        insertedIds: result.insertedIds,
        errors:
          invalidEntities.length > 0 || result.errorCount > 0
            ? 'Revisar tabla de errores de ingesta'
            : [],
      };
    } catch (error) {
      this.logger.error(`Error en Batch Insert: ${error.message}`);

      return {
        summary: {
          totalProcessed: request.length,
          successCount: 0,
          errorCount: request.length,
        },
        insertedIds: [],
        errors: [
          {
            message: 'Error al procesar el lote completo',
            detail: error.message,
          },
        ],
      };
    }
  }

  async getMovements(filters: MovementFilterDto, companyId: string) {
    const stats = await this.getDashboard(
      { startDate: undefined, endDate: undefined }, //Paso undefined para que en el listado de movimientos siempre me de estadisticas del mes actual
      companyId,
    );
    const movements = await this.repository.findAll(filters, companyId);
    return { ...movements, ...stats };
  }

  async removeEntry(id: string) {
    return await this.repository.delete(id);
  }

  async getDashboard(
    filters: MovementFilterDto | StatsFilterDto,
    companyId: string,
  ) {
    const { startDate, endDate } = filters;

    let start = startDate;
    let end = endDate;

    if (!start) {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      end = now.toISOString().split('T')[0];
    }

    try {
      const stats = await this.repository.getDashboardStats(
        companyId,
        start,
        end,
      );

      // Aquí podría añadir lógica extra para accionistas en el futuro:
      // const userShare = await this.shareholderRepo.getShare(userId, companyId);
      // stats.myPortion = stats.liquidity.total * userShare;

      return stats;
    } catch (error) {
      this.logger.error(`Error calculando stats: ${error.message}`);
      throw error;
    }
  }
}
