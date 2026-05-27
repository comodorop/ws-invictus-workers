import { Knex } from 'knex';

/**
 * Tabla maestra de usuarios (schema public).
 * Aqui se acumulan todos los registros publicos de la plataforma.
 * Los usuarios arrancan siempre con plan "free" y rol "member".
 */
export async function up(knex: Knex): Promise<void> {
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

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').dropTableIfExists('users');
}
