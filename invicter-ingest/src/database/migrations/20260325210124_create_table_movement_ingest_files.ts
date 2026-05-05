import type { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex: Knex) {
  return knex.schema
    .withSchema('t_free')
    .createTable('movement_ingest_files', (table) => {
      // ID con gen_random_uuid()
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Relación con companies
      table
        .uuid('company_id')
        .notNullable()
        .references('id')
        .inTable('t_free.companies')
        .onDelete('CASCADE');

      // Identificación del archivo
      table.string('file_id', 255).notNullable();
      table.string('file_name', 255).notNullable();

      // Usuario que lo subió
      table.uuid('uploaded_by');

      // Estado con Check Constraint
      table.string('status', 30).notNullable().defaultTo('PENDING');

      // Métricas
      table.integer('total_records').defaultTo(0);
      table.integer('success_records').defaultTo(0);
      table.integer('error_records').defaultTo(0);

      // Auditoría
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('started_at', { useTz: true });
      table.timestamp('completed_at', { useTz: true });

      // Índice compuesto
      table.index(['company_id', 'status'], 'idx_ingest_files_company_status');
    })
    .then(() => {
      // Añadir el CHECK constraint manualmente ya que Knex no tiene un método nativo fluido para esto
      return knex.raw(`
        ALTER TABLE t_free.movement_ingest_files 
        ADD CONSTRAINT status_check 
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'))
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex: Knex) {
  return knex.schema
    .withSchema('t_free')
    .dropTableIfExists('movement_ingest_files');
};
