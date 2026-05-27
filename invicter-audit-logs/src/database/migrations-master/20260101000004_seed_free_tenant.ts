import { Knex } from 'knex';

/**
 * Seed: inserta el tenant "free" con ID fijo en la tabla maestra.
 *
 * Por qué un ID fijo:
 *   - Todos los usuarios de plan free comparten el schema t_free.
 *   - En lugar de crear un tenant por usuario, existe UN solo registro
 *     que representa toda la capa free de la plataforma.
 *   - El ID "free" es conocido, así que en producción puedes correr:
 *       POST /tenants/free/migrate
 *     para aplicar migraciones nuevas a todos los usuarios free de una vez.
 *
 * Aislamiento de datos dentro de t_free:
 *   - Cada usuario tiene su propio uuid (de public.users).
 *   - Las tablas en t_free usan la columna tenant_id = uuid del usuario.
 *   - Así cada quien ve solo sus propios datos aunque compartan el schema.
 */
export async function up(knex: Knex): Promise<void> {
  const exists = await knex('tenants').where({ id: 'free' }).first();
  if (!exists) {
    await knex('tenants').insert({
      id: 'free',
      name: 'Free Tier',
      subdomain: 'free',
      schema: 't_free',
      plan: 'free',
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('tenants').where({ id: 'free' }).delete();
}
