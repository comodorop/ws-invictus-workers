import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // 1. Agregar nueva columna UUID
  await knex.schema.withSchema('t_free').table('companies', (table) => {
    table.uuid('id');
  });

  // 2. Llenar con UUIDs nuevos (o convertir si aplica)
  await knex.raw(`
    UPDATE t_free.companies
    SET id = uuid_generate_v4();
  `);

  // 3. Hacer NOT NULL
  await knex.schema.withSchema('t_free').table('companies', (table) => {
    table.uuid('id').notNullable().alter();
  });

  // 4. Quitar PK anterior
  await knex.raw(`
    ALTER TABLE t_free.companies DROP CONSTRAINT companies_pkey;
  `);

  // 5. Asignar nueva PK
  await knex.raw(`
    ALTER TABLE t_free.companies ADD PRIMARY KEY (id);
  `);

  // 6. Eliminar columna vieja
  await knex.schema.withSchema('t_free').table('companies', (table) => {
    table.dropColumn('uuid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').table('companies', (table) => {
    table.string('uuid');
  });

  await knex.raw(`
    UPDATE t_free.companies
    SET uuid = id::text;
  `);

  await knex.raw(`
    ALTER TABLE t_free.companies DROP CONSTRAINT companies_pkey;
  `);

  await knex.raw(`
    ALTER TABLE t_free.companies ADD PRIMARY KEY (uuid);
  `);

  await knex.schema.withSchema('t_free').table('companies', (table) => {
    table.dropColumn('id');
  });
}
