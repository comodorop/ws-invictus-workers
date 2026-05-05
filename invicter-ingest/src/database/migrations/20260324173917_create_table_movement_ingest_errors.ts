import type { Knex } from 'knex';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex: Knex) {
  await knex.schema
    .withSchema('t_free')
    .createTable('movement_ingest_errors', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('company_id')
        .notNullable()
        .references('id')
        .inTable('t_free.companies')
        .onDelete('CASCADE');

      // JSON completo de la fila fallida
      table.jsonb('raw_payload').notNullable();

      // Tipo de error
      table.string('error_type', 50).notNullable();

      // Mensaje técnico de la DB
      table.text('db_error_message');

      // Estado
      table
        .string('status', 20)
        .defaultTo('PENDING')
        .checkIn(['PENDING', 'RESOLVED', 'IGNORED']);

      // Nombre del archivo
      table.string('file_name', 255);

      // Timestamp
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    });

  // Índice compuesto
  await knex.schema
    .withSchema('t_free')
    .table('movement_ingest_errors', (table) => {
      table.index(['company_id', 'status'], 'idx_ingest_errors_company_status');
    });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex: Knex) {
  await knex.schema
    .withSchema('t_free')
    .dropTableIfExists('movement_ingest_errors');
};
