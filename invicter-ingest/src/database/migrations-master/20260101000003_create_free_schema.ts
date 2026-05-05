import { Knex } from 'knex';

/**
 * Crea el schema compartido para todos los usuarios de plan free.
 *
 * Este schema se crea una sola vez. Todos los tenants free comparten
 * las mismas tablas y se distinguen por la columna tenant_id.
 *
 * Las tablas dentro de t_free las crea: npm run migrate:free:latest
 * Este archivo solo crea el schema (el contenedor).
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS "t_free"`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP SCHEMA IF EXISTS "t_free" CASCADE`);
}
