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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
let IngestRepository = class IngestRepository {
    constructor(tenantConn) {
        this.tenantConn = tenantConn;
    }
    async create(entity) {
        const db = await this.tenantConn.getConnection('free');
        const insertData = {
            ...entity,
            metadata: typeof entity.metadata === 'object'
                ? JSON.stringify(entity.metadata)
                : entity.metadata,
        };
        const [saved] = await db('movements')
            .insert(insertData)
            .onConflict([
            'company_id',
            'date',
            'description',
            'amount',
            'account_type',
            'category_type',
        ])
            .merge()
            .returning('*');
        return saved;
    }
    async createMany(entities, fileName) {
        const db = await this.tenantConn.getConnection('free');
        const BATCH_SIZE = 500;
        const results = {
            insertedIds: [],
            errorCount: 0,
        };
        for (let i = 0; i < entities.length; i += BATCH_SIZE) {
            const chunk = entities.slice(i, i + BATCH_SIZE);
            const formattedChunk = chunk.map((entity) => ({
                ...entity,
                metadata: typeof entity.metadata === 'object'
                    ? JSON.stringify(entity.metadata)
                    : entity.metadata,
            }));
            try {
                const saved = await db('movements')
                    .insert(formattedChunk)
                    .onConflict([
                    'company_id',
                    'date',
                    'description',
                    'amount',
                    'account_type',
                    'category_type',
                ])
                    .merge()
                    .returning('id');
                results.insertedIds.push(...saved.map((r) => r.id));
            }
            catch (error) {
                console.log(`Lote fallido (índice ${i}). Intentando inserción individual para rescatar registros.`);
                for (const entity of formattedChunk) {
                    try {
                        const [saved] = await db('movements')
                            .insert(entity)
                            .onConflict([
                            'company_id',
                            'date',
                            'description',
                            'amount',
                            'account_type',
                            'category_type',
                        ])
                            .merge()
                            .returning('id');
                        results.insertedIds.push(saved.id);
                    }
                    catch (individualError) {
                        results.errorCount++;
                        await db('movement_ingest_errors').insert({
                            company_id: entity.company_id,
                            raw_payload: entity,
                            error_type: 'DB_CONSTRAINT_VIOLATION',
                            db_error_message: individualError.message,
                            file_name: fileName || 'N/A',
                            status: 'PENDING',
                        });
                    }
                }
            }
        }
        return results;
    }
    async findAll(filters, companyId) {
        const db = await this.tenantConn.getConnection('free');
        const { page = 1, limit = 10, search, sortBy = 'date', sortOrder = 'desc', ...rest } = filters;
        const query = db('movements as m')
            .leftJoin('accounting_catalog as ac', 'm.accounting_code', 'ac.code')
            .where({ 'm.company_id': companyId });
        if (rest.startDate)
            query.where('m.date', '>=', rest.startDate);
        if (rest.endDate)
            query.where('m.date', '<=', rest.endDate);
        if (rest.accountType)
            query.where('m.account_type', rest.accountType);
        if (rest.categoryType)
            query.where('m.category_type', rest.categoryType);
        if (rest.isFiscal !== undefined)
            query.where('m.is_fiscal', rest.isFiscal);
        if (search) {
            query.andWhere((builder) => {
                builder
                    .where('m.description', 'ilike', `%${search}%`)
                    .orWhere('m.account_type', 'ilike', `%${search}%`)
                    .orWhere('m.category_type', 'ilike', `%${search}%`)
                    .orWhere('ac.name', 'ilike', `%${search}%`)
                    .orWhere('ac.code', 'ilike', `%${search}%`);
            });
        }
        const totalRes = await query
            .clone()
            .clearSelect()
            .count('m.id as count')
            .first();
        const total = Number(totalRes?.count || 0);
        const allowedSortColumns = {
            amount: 'm.amount',
            date: 'm.date',
            description: 'm.description',
            category: 'ac.name',
            created_at: 'm.created_at',
        };
        const column = allowedSortColumns[sortBy] || 'm.date';
        const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
        const data = await query
            .select('m.*', 'ac.name as catalog_name', 'ac.code as catalog_code')
            .orderBy(column, direction)
            .limit(limit)
            .offset((page - 1) * limit);
        return {
            data,
            total,
            page,
            limit,
            lastPage: Math.ceil(total / limit),
        };
    }
    async delete(id) {
        const db = await this.tenantConn.getConnection('free');
        return await db('movements').where({ id }).del();
    }
    async getDashboardStats(companyId, startDate, endDate) {
        const db = await this.tenantConn.getConnection('free');
        const start = startDate ||
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const end = endDate || new Date().toISOString();
        const [cashFlow, liquidity, topExpenses, fiscalRatio] = await Promise.all([
            db.raw(`
        SELECT 
            DATE_TRUNC('month', m.date) AS mes,
            SUM(CASE WHEN m.category_type = 'INCOME' THEN m.amount ELSE 0 END) AS ingresos,
            SUM(CASE WHEN m.category_type = 'EXPENSE' THEN m.amount ELSE 0 END) AS egresos,
            SUM(CASE WHEN m.category_type = 'INCOME' THEN m.amount ELSE -m.amount END) AS neto
        FROM movements m
        WHERE m.company_id = ? AND m.date BETWEEN ? AND ?
        GROUP BY mes ORDER BY mes
      `, [companyId, start, end]),
            db.raw(`
        SELECT 
            account_type, 
            SUM(CASE WHEN category_type = 'INCOME' THEN amount ELSE -amount END) AS saldo_actual
        FROM movements
        WHERE company_id = ? AND date BETWEEN ? AND ?
        GROUP BY account_type
      `, [companyId, start, end]),
            db.raw(`
        SELECT 
            ac.name as description, SUM(m.amount) AS total_gastado
        FROM movements m
        LEFT JOIN accounting_catalog ac ON ac.code = m.accounting_code
        WHERE m.company_id = ? AND m.category_type = 'EXPENSE' AND m.date BETWEEN ? AND ?
        GROUP BY ac.name ORDER BY total_gastado DESC LIMIT 5
      `, [companyId, start, end]),
            db.raw(`
        SELECT 
            is_fiscal, 
            SUM(amount) AS monto_total,
            ROUND((SUM(amount) / NULLIF(SUM(SUM(amount)) OVER(), 0)) * 100, 2) AS porcentaje
        FROM movements
        WHERE company_id = ? AND date BETWEEN ? AND ?
        GROUP BY is_fiscal
      `, [companyId, start, end]),
        ]);
        return {
            cashFlow: cashFlow.rows,
            liquidity: liquidity.rows,
            topExpenses: topExpenses.rows,
            fiscalRatio: fiscalRatio.rows,
            period: { start, end },
        };
    }
};
exports.IngestRepository = IngestRepository;
exports.IngestRepository = IngestRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], IngestRepository);
//# sourceMappingURL=movement.repository.js.map