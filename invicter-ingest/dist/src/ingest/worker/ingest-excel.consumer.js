"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IngestExcelConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestExcelConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const gcp_storage_service_1 = require("../../utils/gcp.storage.service");
const movement_repository_1 = require("../movement.repository");
const movement_mapper_1 = require("../mappers/movement.mapper");
const XLSX = require("xlsx");
const movementIngestFile_repository_1 = require("../movementIngestFile.repository");
let IngestExcelConsumer = IngestExcelConsumer_1 = class IngestExcelConsumer {
    constructor(gcpStorage, repository, mapper, ingestFileRepository) {
        this.gcpStorage = gcpStorage;
        this.repository = repository;
        this.mapper = mapper;
        this.ingestFileRepository = ingestFileRepository;
        this.logger = new common_1.Logger(IngestExcelConsumer_1.name);
    }
    async processExcel(data, context) {
        let movementIngestFileStatus = 'COMPLETED';
        await this.ingestFileRepository.update({ file_id: data.fileId }, { status: 'PROCESSING', started_at: new Date() });
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const db = await this.repository['tenantConn'].getConnection('free');
        try {
            const buffer = await this.gcpStorage.download(data.fileId);
            const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });
            const VALID_CURRENCIES = new Set(['MXN', 'USD', 'EUR']);
            const VALID_ACCOUNT_TYPES = new Set(['BANK', 'CASH']);
            const VALID_CATEGORY_TYPES = new Set(['INCOME', 'EXPENSE']);
            const accountingCodesFromDB = await db('accounting_catalog').select('code');
            const VALID_ACCOUNTING_CODES = new Set(accountingCodesFromDB.map((c) => c.code));
            const { validEntities, invalidEntities } = rows.reduce((acc, row) => {
                const errors = [];
                let rawDate = row.fecha || row.date;
                if (rawDate instanceof Date) {
                    rawDate = rawDate.toISOString().split('T')[0];
                }
                else if (typeof rawDate === 'number') {
                    rawDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
                        .toISOString()
                        .split('T')[0];
                }
                const amount = parseFloat(row.monto || row.amount);
                const accountType = row.tipoCuenta || row.accountType;
                const categoryType = row.tipoCategoria || row.categoryType;
                const currency = row.moneda || row.currency || 'MXN';
                let normalizedIsFiscal = '';
                const rawFiscal = row.esFiscal ?? row.isFiscal;
                if (typeof rawFiscal === 'string') {
                    const value = rawFiscal.trim().toUpperCase();
                    if (value === 'SI')
                        normalizedIsFiscal = true;
                    else if (value === 'NO')
                        normalizedIsFiscal = false;
                    else
                        errors.push('INVALID_FISCAL');
                }
                else if (typeof rawFiscal === 'boolean') {
                    normalizedIsFiscal = rawFiscal;
                }
                else {
                    errors.push('INVALID_FISCAL');
                }
                const accountingCode = row.accountingCode;
                if (isNaN(amount))
                    errors.push('INVALID_AMOUNT');
                if (!rawDate)
                    errors.push('MISSING_DATE');
                if (!VALID_CURRENCIES.has(currency))
                    errors.push('INVALID_CURRENCY');
                if (!VALID_ACCOUNT_TYPES.has(accountType))
                    errors.push('INVALID_ACCOUNT_TYPE');
                if (!VALID_CATEGORY_TYPES.has(categoryType))
                    errors.push('INVALID_CATEGORY_TYPE');
                if (!VALID_ACCOUNTING_CODES.has(accountingCode))
                    errors.push('INVALID_ACCOUNTING_CODE');
                const entity = {
                    company_id: data.companyId,
                    amount,
                    date: rawDate,
                    is_fiscal: typeof normalizedIsFiscal == 'string'
                        ? false
                        : normalizedIsFiscal,
                    description: row.descripcion || row.description || 'Sin descripción',
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
                }
                else {
                    acc.invalidEntities.push({
                        entity,
                        errors,
                    });
                }
                return acc;
            }, {
                validEntities: [],
                invalidEntities: [],
            });
            if (invalidEntities.length) {
                await db('movement_ingest_errors').insert(invalidEntities.map((e) => ({
                    company_id: data.companyId,
                    raw_payload: e.entity,
                    error_type: JSON.stringify(e.errors),
                    db_error_message: null,
                    file_name: data.originalName,
                    status: 'PENDING',
                    ingest_file_id: data.ingestFileId,
                })));
            }
            if (validEntities.length > 0) {
                const result = await this.repository.createMany(validEntities, data.originalName);
                this.logger.log(`Procesados: ${rows.length}, Insertados: ${result.insertedIds.length}, Errores: ${invalidEntities.length + result.errorCount}`);
            }
            if (validEntities.length > 0 && invalidEntities.length > 0) {
                movementIngestFileStatus = 'COMPLETED_WITH_ERRORS';
            }
            else if (validEntities.length == 0 && invalidEntities.length > 0) {
                movementIngestFileStatus = 'FAILED';
            }
            await this.ingestFileRepository.update({ file_id: data.fileId }, { status: movementIngestFileStatus, total_records: rows.length, success_records: validEntities.length, error_records: invalidEntities.length, completed_at: new Date() });
            channel.ack(originalMsg);
        }
        catch (error) {
            this.logger.error(`Fallo en el procesamiento de Excel: ${error.message}`);
            channel.nack(originalMsg, false, false);
        }
    }
};
exports.IngestExcelConsumer = IngestExcelConsumer;
__decorate([
    (0, microservices_1.EventPattern)('excel_queue'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], IngestExcelConsumer.prototype, "processExcel", null);
exports.IngestExcelConsumer = IngestExcelConsumer = IngestExcelConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [gcp_storage_service_1.GcpStorageService,
        movement_repository_1.IngestRepository,
        movement_mapper_1.MovementMapper,
        movementIngestFile_repository_1.MovementIngestFileRepository])
], IngestExcelConsumer);
//# sourceMappingURL=ingest-excel.consumer.js.map