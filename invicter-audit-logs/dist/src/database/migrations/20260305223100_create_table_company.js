"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.withSchema('t_free').createTable('companies', (t) => {
        t.string('uuid').primary();
        t.string('uuidTenants').notNullable();
        t.string('uuidUser').notNullable();
        t.string('name').notNullable();
        t.string('description').notNullable();
        t.timestamp('created_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) { }
//# sourceMappingURL=20260305223100_create_table_company.js.map