"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema
        .withSchema('public')
        .createTableIfNotExists('users', (t) => {
        t.uuid('uuid').primary().defaultTo(knex.raw('gen_random_uuid()'));
        t.string('name', 100).notNullable();
        t.string('email', 255).notNullable().unique();
        t.string('password', 255).notNullable();
        t.boolean('isChecked').notNullable().defaultTo(false);
        t.enum('role', ['admin', 'member']).notNullable().defaultTo('member');
        t.enum('plan', ['free', 'pro']).notNullable().defaultTo('free');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) {
    await knex.schema.withSchema('public').dropTableIfExists('users');
}
//# sourceMappingURL=20260101000002_create_users_master.js.map