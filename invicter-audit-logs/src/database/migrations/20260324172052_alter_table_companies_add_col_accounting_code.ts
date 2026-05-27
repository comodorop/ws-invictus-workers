import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
    // Es un string independiente. No tiene FK física.
    t.string('accounting_code', 50).nullable();

    // Índice para reportes rápidos
    t.index(['accounting_code'], 'idx_movements_accounting_code');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
    t.dropColumn('accounting_code');
  });
}
