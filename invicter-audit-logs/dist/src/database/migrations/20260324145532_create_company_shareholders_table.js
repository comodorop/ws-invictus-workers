"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    const schema = 't_free';
    await knex.schema
        .withSchema(schema)
        .createTable('company_shareholders', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        t.uuid('company_id')
            .notNullable()
            .references('id')
            .inTable(`${schema}.companies`)
            .onDelete('CASCADE');
        t.uuid('investor_profile_id')
            .notNullable()
            .references('id')
            .inTable(`${schema}.investor_profiles`)
            .onDelete('CASCADE');
        t.decimal('share_percentage', 5, 2).notNullable();
        t.string('role', 50)
            .defaultTo('CAPITAL_PARTNER')
            .checkIn([
            'FOUNDER',
            'CAPITAL_PARTNER',
            'OPERATING_PARTNER',
            'MANAGING_PARTNER',
            'ADVISOR_SHAREHOLDER',
        ]);
        t.date('investment_date').defaultTo(knex.fn.now());
        t.timestamps(true, true);
        t.unique(['company_id', 'investor_profile_id'], {
            indexName: 'uq_company_investor',
        });
        t.check('share_percentage > 0 AND share_percentage <= 100', [], 'share_percentage_check');
    });
}
async function down(knex) {
    await knex.schema
        .withSchema('t_free')
        .dropTableIfExists('company_shareholders');
}
//# sourceMappingURL=20260324145532_create_company_shareholders_table.js.map