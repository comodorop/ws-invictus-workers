"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    const schema = 't_free';
    await knex.schema.withSchema(schema).createTable('investor_profiles', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        t.string('user_id', 255).notNullable().unique();
        t.string('tax_id', 20).nullable();
        t.string('legal_name', 255).notNullable();
        t.enum('investor_type', [
            'INDIVIDUAL_MX',
            'ENTITY_MX',
            'INDIVIDUAL_FOREIGN',
            'ENTITY_FOREIGN',
        ]).defaultTo('INDIVIDUAL_MX');
        t.timestamps(true, true);
    });
}
async function down(knex) {
    await knex.schema.withSchema('t_free').dropTableIfExists('investor_profiles');
}
//# sourceMappingURL=20260324144753_create_investor_profiles.js.map