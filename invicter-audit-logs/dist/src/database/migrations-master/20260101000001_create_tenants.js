"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema
        .withSchema('public')
        .createTableIfNotExists('tenants', (t) => {
        t.string('id').primary();
        t.string('name').notNullable();
        t.string('subdomain').notNullable().unique();
        t.string('schema').notNullable().unique();
        t.enum('plan', ['free', 'pro']).notNullable().defaultTo('free');
        t.string('db_host').nullable();
        t.integer('db_port').nullable();
        t.string('db_name').nullable();
        t.string('db_user').nullable();
        t.string('db_password').nullable();
        t.timestamp('created_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) {
    await knex.schema.withSchema('public').dropTableIfExists('tenants');
}
//# sourceMappingURL=20260101000001_create_tenants.js.map