"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema
        .withSchema('t_free')
        .createTable('movement_ingest_files', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table
            .uuid('company_id')
            .notNullable()
            .references('id')
            .inTable('t_free.companies')
            .onDelete('CASCADE');
        table.string('file_id', 255).notNullable();
        table.string('file_name', 255).notNullable();
        table.uuid('uploaded_by');
        table.string('status', 30).notNullable().defaultTo('PENDING');
        table.integer('total_records').defaultTo(0);
        table.integer('success_records').defaultTo(0);
        table.integer('error_records').defaultTo(0);
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp('started_at', { useTz: true });
        table.timestamp('completed_at', { useTz: true });
        table.index(['company_id', 'status'], 'idx_ingest_files_company_status');
    })
        .then(() => {
        return knex.raw(`
        ALTER TABLE t_free.movement_ingest_files 
        ADD CONSTRAINT status_check 
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'))
      `);
    });
};
exports.down = function (knex) {
    return knex.schema
        .withSchema('t_free')
        .dropTableIfExists('movement_ingest_files');
};
//# sourceMappingURL=20260325210124_create_table_movement_ingest_files.js.map