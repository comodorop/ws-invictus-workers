"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    const schema = 't_free';
    await knex.schema.withSchema(schema).createTable('movements', (t) => {
        t.uuid('uuid').primary().defaultTo(knex.raw('gen_random_uuid()'));
        t.uuid('company_id')
            .references('id')
            .inTable(`${schema}.companies`)
            .onDelete('CASCADE');
        t.decimal('amount', 15, 2).notNullable();
        t.date('date').notNullable();
        t.boolean('is_fiscal').defaultTo(true);
        t.text('description');
        t.string('account_type').notNullable();
        t.string('currency', 3).defaultTo('MXN');
        t.string('category_type').notNullable();
        t.timestamps(true, true);
        t.json('metadata').notNullable();
        t.check(`"account_type" IN ('BANK', 'CASH')`, [], 'accounts_type_check');
        t.check(`"category_type" IN ('INCOME', 'EXPENSE')`, [], 'categories_type_check');
    });
}
async function down(knex) { }
//# sourceMappingURL=20260318233804_movements.js.map