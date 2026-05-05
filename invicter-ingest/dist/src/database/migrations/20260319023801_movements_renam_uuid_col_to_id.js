"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    const schema = 't_free';
    const table = 'movements';
    await knex.schema.withSchema(schema).alterTable(table, (t) => {
        t.renameColumn('uuid', 'id');
    });
}
async function down(knex) {
    const schema = 't_free';
    const table = 'movements';
    await knex.schema.withSchema(schema).alterTable(table, (t) => {
        t.renameColumn('id', 'uuid');
    });
}
//# sourceMappingURL=20260319023801_movements_renam_uuid_col_to_id.js.map