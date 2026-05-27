"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
        t.string('accounting_code', 50).nullable();
        t.index(['accounting_code'], 'idx_movements_accounting_code');
    });
}
async function down(knex) {
    await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
        t.dropColumn('accounting_code');
    });
}
//# sourceMappingURL=20260324172052_alter_table_companies_add_col_accounting_code.js.map