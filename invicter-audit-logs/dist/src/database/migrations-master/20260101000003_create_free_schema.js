"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`CREATE SCHEMA IF NOT EXISTS "t_free"`);
}
async function down(knex) {
    await knex.raw(`DROP SCHEMA IF EXISTS "t_free" CASCADE`);
}
//# sourceMappingURL=20260101000003_create_free_schema.js.map