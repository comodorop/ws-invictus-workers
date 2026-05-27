"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await knex.schema.withSchema('t_free').table('companies', (table) => {
        table.uuid('id');
    });
    await knex.raw(`
    UPDATE t_free.companies
    SET id = uuid_generate_v4();
  `);
    await knex.schema.withSchema('t_free').table('companies', (table) => {
        table.uuid('id').notNullable().alter();
    });
    await knex.raw(`
    ALTER TABLE t_free.companies DROP CONSTRAINT companies_pkey;
  `);
    await knex.raw(`
    ALTER TABLE t_free.companies ADD PRIMARY KEY (id);
  `);
    await knex.schema.withSchema('t_free').table('companies', (table) => {
        table.dropColumn('uuid');
    });
}
async function down(knex) {
    await knex.schema.withSchema('t_free').table('companies', (table) => {
        table.string('uuid');
    });
    await knex.raw(`
    UPDATE t_free.companies
    SET uuid = id::text;
  `);
    await knex.raw(`
    ALTER TABLE t_free.companies DROP CONSTRAINT companies_pkey;
  `);
    await knex.raw(`
    ALTER TABLE t_free.companies ADD PRIMARY KEY (uuid);
  `);
    await knex.schema.withSchema('t_free').table('companies', (table) => {
        table.dropColumn('id');
    });
}
//# sourceMappingURL=20260318175326_alter_table_companies_modify_uuid.js.map