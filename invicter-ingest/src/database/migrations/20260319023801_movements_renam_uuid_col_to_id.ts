import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const schema = 't_free';
  const table = 'movements';

  await knex.schema.withSchema(schema).alterTable(table, (t) => {
    // Renombrar de uuid a id
    t.renameColumn('uuid', 'id');
  });
}

export async function down(knex: Knex): Promise<void> {
  const schema = 't_free';
  const table = 'movements';

  await knex.schema.withSchema(schema).alterTable(table, (t) => {
    // Revertir el cambio
    t.renameColumn('id', 'uuid');
  });
}
