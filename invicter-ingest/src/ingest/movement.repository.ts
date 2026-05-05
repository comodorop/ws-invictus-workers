import { Injectable } from '@nestjs/common';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { MovementEntity } from './entities/movement.entity';
import { MovementFilterDto } from './dto/movement.dto';
// import { randomUUID } from 'crypto';

@Injectable()
export class IngestRepository {
  constructor(private readonly tenantConn: TenantConnectionService) {}

  async create(entity: MovementEntity) {
    const db = await this.tenantConn.getConnection('free');
    const insertData = {
      ...entity,
      metadata:
        typeof entity.metadata === 'object'
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
      .merge() // Si hay conflicto, "fusiona" (hace un upsert)
      .returning('*');

    return saved;
  }

  async createMany(entities: MovementEntity[], fileName?: string) {
    const db = await this.tenantConn.getConnection('free');
    const BATCH_SIZE = 500;
    const results: { insertedIds: string[]; errorCount: number } = {
      insertedIds: [],
      errorCount: 0,
    };

    // Procesamos por lotes
    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const chunk = entities.slice(i, i + BATCH_SIZE);

      const formattedChunk = chunk.map((entity) => ({
        ...entity,
        metadata:
          typeof entity.metadata === 'object'
            ? JSON.stringify(entity.metadata)
            : entity.metadata,
      }));

      try {
        // Intento de inserción masiva por lote
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
      } catch (error) {
        console.log(
          `Lote fallido (índice ${i}). Intentando inserción individual para rescatar registros.`,
        );

        // FALLBACK: Si el lote falla, procesamos uno por uno
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
          } catch (individualError) {
            // GUARDAR EN TABLA DE ERRORES
            results.errorCount++;
            await db('movement_ingest_errors').insert({
              company_id: entity.company_id,
              raw_payload: entity, // Se guarda el JSON del registro fallido
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

  // async findAll(filters: MovementFilterDto, companyId: string) {
  //   const db = await this.tenantConn.getConnection('free');
  //   const {
  //     page = 1,
  //     limit = 10,
  //     search,
  //     sortBy = 'date',
  //     sortOrder = 'desc',
  //     ...rest
  //   } = filters;

  //   const query = db('movements').where({ company_id: companyId });

  //   // 1. Filtros exactos y de rango
  //   if (rest.startDate) query.where('date', '>=', rest.startDate);
  //   if (rest.endDate) query.where('date', '<=', rest.endDate);
  //   if (rest.accountType) query.where('account_type', rest.accountType);
  //   if (rest.categoryType) query.where('category_type', rest.categoryType);
  //   if (rest.isFiscal !== undefined) query.where('is_fiscal', rest.isFiscal);

  //   // 2. Búsqueda Global (Full Text Search amigable)
  //   if (search) {
  //     query.andWhere((builder) => {
  //       builder
  //         .where('description', 'ilike', `%${search}%`)
  //         .orWhere('account_type', 'ilike', `%${search}%`)
  //         .orWhere('category_type', 'ilike', `%${search}%`);
  //     });
  //   }

  //   // 3. Conteo del total filtrado
  //   const totalRes = await query.clone().count('id as count').first();
  //   const total = Number(totalRes?.count || 0);

  //   // 4. Ordenamiento Dinámico (con Whitelist de columnas)
  //   const allowedSortColumns = [
  //     'amount',
  //     'date',
  //     'description',
  //     'account_type',
  //     'category_type',
  //     'created_at',
  //   ];
  //   const column = allowedSortColumns.includes(sortBy) ? sortBy : 'date';
  //   const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

  //   const data = await query
  //     .orderBy(column, direction)
  //     .limit(limit)
  //     .offset((page - 1) * limit);

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     lastPage: Math.ceil(total / limit),
  //   };
  // }

  async findAll(filters: MovementFilterDto, companyId: string) {
    const db = await this.tenantConn.getConnection('free');
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      ...rest
    } = filters;

    // 1. Definimos la QUERY BASE (Solo Joins y Filtros base, SIN SELECT todavía)
    const query = db('movements as m')
      .leftJoin('accounting_catalog as ac', 'm.accounting_code', 'ac.code')
      .where({ 'm.company_id': companyId });

    // 2. Aplicamos Filtros de rango y exactos
    if (rest.startDate) query.where('m.date', '>=', rest.startDate);
    if (rest.endDate) query.where('m.date', '<=', rest.endDate);
    if (rest.accountType) query.where('m.account_type', rest.accountType);
    if (rest.categoryType) query.where('m.category_type', rest.categoryType);
    if (rest.isFiscal !== undefined) query.where('m.is_fiscal', rest.isFiscal);

    // 3. Búsqueda Global
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

    // 4. CONTEO: Al clonar aquí, el objeto está "limpio" de selectores m.*
    // Usamos .clearSelect() por seguridad extra por si Knex arrastra algo
    const totalRes = await query
      .clone()
      .clearSelect()
      .count('m.id as count')
      .first();
    const total = Number(totalRes?.count || 0);

    // 5. ORDENAMIENTO
    const allowedSortColumns: Record<string, string> = {
      amount: 'm.amount',
      date: 'm.date',
      description: 'm.description',
      category: 'ac.name',
      created_at: 'm.created_at',
    };

    const column = allowedSortColumns[sortBy] || 'm.date';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // 6. DATOS: Aquí sí aplicamos el SELECT, LIMIT y OFFSET
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

  async delete(id: string) {
    const db = await this.tenantConn.getConnection('free');
    return await db('movements').where({ id }).del();
  }

  //ESTADISTICAS

  async getDashboardStats(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const db = await this.tenantConn.getConnection('free');

    // Lógica por defecto: Mes actual si no hay fechas
    const start =
      startDate ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();
    const end = endDate || new Date().toISOString();

    // Ejecutamos todas las consultas en paralelo para máxima velocidad
    const [cashFlow, liquidity, topExpenses, fiscalRatio] = await Promise.all([
      // 1. Flujo de Caja
      db.raw(
        `
        SELECT 
            DATE_TRUNC('month', m.date) AS mes,
            SUM(CASE WHEN m.category_type = 'INCOME' THEN m.amount ELSE 0 END) AS ingresos,
            SUM(CASE WHEN m.category_type = 'EXPENSE' THEN m.amount ELSE 0 END) AS egresos,
            SUM(CASE WHEN m.category_type = 'INCOME' THEN m.amount ELSE -m.amount END) AS neto
        FROM movements m
        WHERE m.company_id = ? AND m.date BETWEEN ? AND ?
        GROUP BY mes ORDER BY mes
      `,
        [companyId, start, end],
      ),

      // 2. Liquidez
      db.raw(
        `
        SELECT 
            account_type, 
            SUM(CASE WHEN category_type = 'INCOME' THEN amount ELSE -amount END) AS saldo_actual
        FROM movements
        WHERE company_id = ? AND date BETWEEN ? AND ?
        GROUP BY account_type
      `,
        [companyId, start, end],
      ),

      // 3. Top Gastos
      db.raw(
        `
        SELECT 
            ac.name as description, SUM(m.amount) AS total_gastado
        FROM movements m
        LEFT JOIN accounting_catalog ac ON ac.code = m.accounting_code
        WHERE m.company_id = ? AND m.category_type = 'EXPENSE' AND m.date BETWEEN ? AND ?
        GROUP BY ac.name ORDER BY total_gastado DESC LIMIT 5
      `,
        [companyId, start, end],
      ),

      // 4. Ratio Fiscal (Usando Window Function para el % real)
      db.raw(
        `
        SELECT 
            is_fiscal, 
            SUM(amount) AS monto_total,
            ROUND((SUM(amount) / NULLIF(SUM(SUM(amount)) OVER(), 0)) * 100, 2) AS porcentaje
        FROM movements
        WHERE company_id = ? AND date BETWEEN ? AND ?
        GROUP BY is_fiscal
      `,
        [companyId, start, end],
      ),
    ]);

    return {
      cashFlow: cashFlow.rows,
      liquidity: liquidity.rows,
      topExpenses: topExpenses.rows,
      fiscalRatio: fiscalRatio.rows,
      period: { start, end },
    };
  }
}
