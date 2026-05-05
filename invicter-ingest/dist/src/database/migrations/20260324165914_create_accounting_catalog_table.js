"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema
        .withSchema('t_free')
        .createTable('accounting_catalog', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        t.string('code', 50).notNullable().unique();
        t.string('name', 255).notNullable();
        t.string('category_type', 50).notNullable();
        t.text('description').nullable();
        t.boolean('is_active').defaultTo(true);
        t.timestamps(true, true);
        t.check(`category_type IN ('INCOME', 'EXPENSE')`, [], 'catalog_type_check');
    });
}
async function down(knex) {
    await knex.schema
        .withSchema('t_free')
        .dropTableIfExists('accounting_catalog');
}
//# sourceMappingURL=20260324165914_create_accounting_catalog_table.js.map