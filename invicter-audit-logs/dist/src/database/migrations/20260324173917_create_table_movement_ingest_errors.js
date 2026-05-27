"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = async function (knex) {
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
        table.jsonb('raw_payload').notNullable();
        table.string('error_type', 50).notNullable();
        table.text('db_error_message');
        table
            .string('status', 20)
            .defaultTo('PENDING')
            .checkIn(['PENDING', 'RESOLVED', 'IGNORED']);
        table.string('file_name', 255);
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    });
    await knex.schema
        .withSchema('t_free')
        .table('movement_ingest_errors', (table) => {
        table.index(['company_id', 'status'], 'idx_ingest_errors_company_status');
    });
};
exports.down = async function (knex) {
    await knex.schema
        .withSchema('t_free')
        .dropTableIfExists('movement_ingest_errors');
};
//# sourceMappingURL=20260324173917_create_table_movement_ingest_errors.js.map