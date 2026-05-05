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
var IngestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestService = void 0;
const common_1 = require("@nestjs/common");
const movement_repository_1 = require("./movement.repository");
const movement_mapper_1 = require("./mappers/movement.mapper");
let IngestService = IngestService_1 = class IngestService {
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
        this.logger = new common_1.Logger(IngestService_1.name);
    }
    async createDirectEntry(request, source, user, companyId) {
        const db = await this.repository['tenantConn'].getConnection('free');
        const VALID_CURRENCIES = new Set(['MXN', 'USD', 'EUR']);
        const VALID_ACCOUNT_TYPES = new Set(['BANK', 'CASH']);
        const VALID_CATEGORY_TYPES = new Set(['INCOME', 'EXPENSE']);
        const accountingCodesFromDB = await db('accounting_catalog').select('code');
        const VALID_ACCOUNTING_CODES = new Set(accountingCodesFromDB.map((c) => c.code));
        const { validEntities, invalidEntities } = request.reduce((acc, e) => {
            const errors = [];
            if (isNaN(e.amount)) {
                errors.push('INVALID_AMOUNT');
            }
            if (!e.date) {
                errors.push('MISSING_DATE');
            }
            if (!VALID_CURRENCIES.has(e.currency)) {
                errors.push('INVALID_CURRENCY');
            }
            if (!VALID_ACCOUNT_TYPES.has(e.accountType)) {
                errors.push('INVALID_ACCOUNT_TYPE');
            }
            if (!VALID_CATEGORY_TYPES.has(e.categoryType)) {
                errors.push('INVALID_CATEGORY_TYPE');
            }
            let normalizedIsFiscal = '';
            if (typeof e.isFiscal === 'string') {
                const value = e.isFiscal.trim().toUpperCase();
                if (value === 'SI')
                    normalizedIsFiscal = true;
                else if (value === 'NO')
                    normalizedIsFiscal = false;
                else
                    errors.push('INVALID_FISCAL');
            }
            else if (typeof e.isFiscal === 'boolean') {
                normalizedIsFiscal = e.isFiscal;
            }
            else {
                errors.push('INVALID_FISCAL');
            }
            if (!VALID_ACCOUNTING_CODES.has(e.accountingCode)) {
                errors.push('INVALID_ACCOUNTING_CODE');
            }
            if (errors.length === 0) {
                acc.validEntities.push({
                    ...e,
                    isFiscal: normalizedIsFiscal,
                });
            }
            else {
                acc.invalidEntities.push({
                    entity: e,
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
                company_id: companyId,
                raw_payload: e.entity,
                error_type: JSON.stringify(e.errors),
                db_error_message: null,
                status: 'PENDING',
            })));
        }
        const dataMapped = validEntities.map((movement) => this.mapper.dtoToEntity({ companyId, ...movement }, source, user));
        try {
            const result = await this.repository.createMany(dataMapped);
            return {
                summary: {
                    totalProcessed: request.length,
                    successCount: result.insertedIds.length,
                    errorCount: invalidEntities.length + result.errorCount,
                },
                insertedIds: result.insertedIds,
                errors: invalidEntities.length > 0 || result.errorCount > 0
                    ? 'Revisar tabla de errores de ingesta'
                    : [],
            };
        }
        catch (error) {
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
    async getMovements(filters, companyId) {
        const stats = await this.getDashboard({ startDate: undefined, endDate: undefined }, companyId);
        const movements = await this.repository.findAll(filters, companyId);
        return { ...movements, ...stats };
    }
    async removeEntry(id) {
        return await this.repository.delete(id);
    }
    async getDashboard(filters, companyId) {
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
            const stats = await this.repository.getDashboardStats(companyId, start, end);
            return stats;
        }
        catch (error) {
            this.logger.error(`Error calculando stats: ${error.message}`);
            throw error;
        }
    }
};
exports.IngestService = IngestService;
exports.IngestService = IngestService = IngestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [movement_repository_1.IngestRepository,
        movement_mapper_1.MovementMapper])
], IngestService);
//# sourceMappingURL=ingest.service.js.map