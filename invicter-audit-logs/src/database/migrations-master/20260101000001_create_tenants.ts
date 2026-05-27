import { Knex } from 'knex';

/**
 * Tabla maestra de tenants (schema public).
 * Registra todos los clientes de la plataforma.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema('public')
    .createTableIfNotExists('tenants', (t) => {
      t.string('id').primary();
      t.string('name').notNullable();
      t.string('subdomain').notNullable().unique();
      t.string('schema').notNullable().unique();
      t.enum('plan', ['free', 'pro']).notNullable().defaultTo('free');
      // BYODB — null cuando el tenant usa la DB compartida del servidor
      t.string('db_host').nullable();
      t.integer('db_port').nullable();
      t.string('db_name').nullable();
      t.string('db_user').nullable();
      t.string('db_password').nullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').dropTableIfExists('tenants');
}
