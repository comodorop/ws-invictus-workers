import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { GcpStorageService } from '../../utils/gcp.storage.service';
import { IngestRepository } from '../movement.repository';
import { MovementMapper } from '../mappers/movement.mapper';
import * as XLSX from 'xlsx'; // Necesitarás instalar xlsx
import { MovementEntity } from '../entities/movement.entity';
import { MovementIngestFileRepository } from '../movementIngestFile.repository';

@Controller()
export class IngestExcelConsumer {
  private readonly logger = new Logger(IngestExcelConsumer.name);

  constructor(
    private readonly gcpStorage: GcpStorageService,
    private readonly repository: IngestRepository,
    private readonly mapper: MovementMapper,
    private readonly ingestFileRepository: MovementIngestFileRepository,
  ) { }

  // src/ingest/consumers/ingest-excel.consumer.ts

  @EventPattern('excel_queue')
  async processExcel(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received message:', data);

    let movementIngestFileStatus:
      | 'PENDING'
      | 'COMPLETED'
      | 'PROCESSING'
      | 'COMPLETED_WITH_ERRORS'
      | 'FAILED'
      | undefined = 'COMPLETED';
    await this.ingestFileRepository.update(
      { file_id: data.fileId },
      { status: 'PROCESSING', started_at: new Date() },
    );

    console.log('Processing file:', data.fileId);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const db = await this.repository['tenantConn'].getConnection('free');

    try {
      const buffer = await this.gcpStorage.download(data.fileId);

      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: true });

      // ================================
      // Ajuste 1: Catálogos en memoria
      // ================================
      const VALID_CURRENCIES = new Set(['MXN', 'USD', 'EUR']);
      const VALID_ACCOUNT_TYPES = new Set(['BANK', 'CASH']);
      const VALID_CATEGORY_TYPES = new Set(['INCOME', 'EXPENSE']);

      const accountingCodesFromDB =
        await db('accounting_catalog').select('code');

      const VALID_ACCOUNTING_CODES = new Set(
        accountingCodesFromDB.map((c) => c.code),
      );

      // ================================
      // Ajuste 2: Transformación + validación en un solo paso
      // ================================
      const { validEntities, invalidEntities } = rows.reduce(
        (acc, row) => {
          const errors: string[] = [];

          // ---- Normalización ----
          let rawDate = row.fecha || row.date;

          if (rawDate instanceof Date) {
            rawDate = rawDate.toISOString().split('T')[0];
          } else if (typeof rawDate === 'number') {
            rawDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
              .toISOString()
              .split('T')[0];
          }

          const amount = parseFloat(row.monto || row.amount);

          const accountType = row.tipoCuenta || row.accountType;
          const categoryType = row.tipoCategoria || row.categoryType;
          const currency = row.moneda || row.currency || 'MXN';

          // ---- isFiscal normalizado ----
          let normalizedIsFiscal: boolean | string = '';
          const rawFiscal = row.esFiscal ?? row.isFiscal;

          if (typeof rawFiscal === 'string') {
            const value = rawFiscal.trim().toUpperCase();
            if (value === 'SI') normalizedIsFiscal = true;
            else if (value === 'NO') normalizedIsFiscal = false;
            else errors.push('INVALID_FISCAL');
          } else if (typeof rawFiscal === 'boolean') {
            normalizedIsFiscal = rawFiscal;
          } else {
            errors.push('INVALID_FISCAL');
          }

          const accountingCode = row.accountingCode;

          // ---- Validaciones ----
          if (isNaN(amount)) errors.push('INVALID_AMOUNT');
          if (!rawDate) errors.push('MISSING_DATE');
          if (!VALID_CURRENCIES.has(currency)) errors.push('INVALID_CURRENCY');
          if (!VALID_ACCOUNT_TYPES.has(accountType))
            errors.push('INVALID_ACCOUNT_TYPE');
          if (!VALID_CATEGORY_TYPES.has(categoryType))
            errors.push('INVALID_CATEGORY_TYPE');
          if (!VALID_ACCOUNTING_CODES.has(accountingCode))
            errors.push('INVALID_ACCOUNTING_CODE');

          // ---- Construcción final ----
          const entity: MovementEntity = {
            company_id: data.companyId,
            amount,
            date: rawDate,
            is_fiscal:
              typeof normalizedIsFiscal == 'string' //Solo lo hacemos para forzar el tipado a boolean, no llegara string por la validacion previa
                ? false
                : normalizedIsFiscal,
            description:
              row.descripcion || row.description || 'Sin descripción',
            account_type: accountType,
            currency,
            category_type: categoryType,
            accounting_code: accountingCode,
            metadata: {
              userId: data.uuidUser,
              sourceType: 'EXCEL',
              fileName: data.originalName,
              transactionId: row.idTransaccion || row.transactionId,
            },
          };

          if (errors.length === 0) {
            acc.validEntities.push(entity);
          } else {
            acc.invalidEntities.push({
              entity,
              errors,
            });
          }

          return acc;
        },
        {
          validEntities: [] as MovementEntity[],
          invalidEntities: [] as {
            entity: MovementEntity;
            errors: string[];
          }[],
        },
      );

      // ================================
      // Ajuste 3: Guardar errores
      // ================================
      if (invalidEntities.length) {
        await db('movement_ingest_errors').insert(
          invalidEntities.map((e: any) => ({
            company_id: data.companyId,
            raw_payload: e.entity,
            error_type: JSON.stringify(e.errors),
            db_error_message: null,
            file_name: data.originalName,
            status: 'PENDING',
            ingest_file_id: data.ingestFileId,
          })),
        );
      }

      // ================================
      // Ajuste 4: Insertar solo válidos
      // ================================
      if (validEntities.length > 0) {
        const result = await this.repository.createMany(
          validEntities,
          data.originalName,
        );

        this.logger.log(
          `Procesados: ${rows.length}, Insertados: ${result.insertedIds.length}, Errores: ${invalidEntities.length + result.errorCount
          }`,
        );
      }

      if (validEntities.length > 0 && invalidEntities.length > 0) {
        movementIngestFileStatus = 'COMPLETED_WITH_ERRORS';
      } else if (validEntities.length == 0 && invalidEntities.length > 0) {
        movementIngestFileStatus = 'FAILED';
      }

      await this.ingestFileRepository.update(
        { file_id: data.fileId },
        { status: movementIngestFileStatus, total_records: rows.length, success_records: validEntities.length, error_records: invalidEntities.length, completed_at: new Date() },
      );

      channel.ack(originalMsg);

      console.log('FINISHED:', data.fileId);
    } catch (error) {
      console.error('ERROR:', error);
      this.logger.error(`Fallo en el procesamiento de Excel: ${error.message}`);
      channel.nack(originalMsg, false, false);
    }
  }
}
