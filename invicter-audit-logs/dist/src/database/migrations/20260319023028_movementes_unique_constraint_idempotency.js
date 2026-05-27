"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
        t.unique([
            'company_id',
            'date',
            'description',
            'amount',
            'account_type',
            'category_type',
        ], { indexName: 'movements_idempotency_unique' });
    });
}
async function down(knex) { }
//# sourceMappingURL=20260319023028_movementes_unique_constraint_idempotency.js.map