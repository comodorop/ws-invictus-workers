import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').createTable('companies', (t) => {
    t.string('uuid').primary();
    t.string('uuidTenants').notNullable();
    t.string('uuidUser').notNullable();
    t.string('name').notNullable();
    t.string('description').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {}
