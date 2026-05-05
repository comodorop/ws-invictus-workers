import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').alterTable('movements', (t) => {
    // ÍNDICE ÚNICO PARA IDEMPOTENCIA
    t.unique(
      [
        'company_id',
        'date',
        'description',
        'amount',
        'account_type',
        'category_type',
      ],
      { indexName: 'movements_idempotency_unique' },
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function down(knex: Knex): Promise<void> {}
