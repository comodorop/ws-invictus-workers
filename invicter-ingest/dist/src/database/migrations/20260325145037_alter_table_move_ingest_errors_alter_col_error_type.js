"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = async function (knex) {
    await knex.schema.alterTable('movement_ingest_errors', (table) => {
        table.jsonb('error_type').alter();
    });
};
exports.down = async function (knex) {
    await knex.schema.alterTable('movement_ingest_errors', (table) => {
        table.string('error_type', 50).alter();
    });
};
//# sourceMappingURL=20260325145037_alter_table_move_ingest_errors_alter_col_error_type.js.map