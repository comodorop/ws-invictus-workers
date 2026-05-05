import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema('t_free')
    .createTable('accounting_catalog', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Código para la ingesta (Ej: 'VENTA_SERV', 'NOMINA')
      t.string('code', 50).notNullable().unique();

      // Nombre para mostrar en el Front (Ej: 'Servicios Profesionales')
      t.string('name', 255).notNullable();

      // Para filtrar rápidamente entre ingresos y egresos
      t.string('category_type', 50).notNullable();

      t.text('description').nullable();
      t.boolean('is_active').defaultTo(true);

      t.timestamps(true, true);

      // Validación a nivel DB
      t.check(
        `category_type IN ('INCOME', 'EXPENSE')`,
        [],
        'catalog_type_check',
      );
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema('t_free')
    .dropTableIfExists('accounting_catalog');
}
