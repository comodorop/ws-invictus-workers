import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const schema = 't_free';

  await knex.schema.withSchema(schema).createTable('movements', (t) => {
    t.uuid('uuid').primary().defaultTo(knex.raw('gen_random_uuid()'));

    t.uuid('company_id')
      .references('id')
      .inTable(`${schema}.companies`)
      .onDelete('CASCADE');

    t.decimal('amount', 15, 2).notNullable();
    t.date('date').notNullable();
    t.boolean('is_fiscal').defaultTo(true);
    t.text('description');

    //accounts
    t.string('account_type').notNullable();
    t.string('currency', 3).defaultTo('MXN');

    //categories
    t.string('category_type').notNullable();

    t.timestamps(true, true);

    /**
     * ESTRUCTURA DE METADATA POR ESCENARIO
     * * 1. EXCEL (Front-end):
     * { user_id: "", sourceType: EXCEL | API | FORM, "file_name": "conciliacion_marzo.xlsx" }
     * Justificación: Permite rastrear errores de dedo en el archivo original y auditoría de quién subió la info.
     * * 2. API (ERP):
     * { user_id: "", sourceType: EXCEL | API | FORM, transactionId: "" }
     * Justificación: Evita la duplicidad (Idempotencia). Si el ERP reintenta, el external_id nos dice que ya existe.
     * * 3. FORM (Manual):
     * { user_id: "", sourceType: EXCEL | API | FORM, reason: Justificar el porque no se envia por API o Excel }
     * Justificación: Control forense. Las entradas manuales son las más sensibles a fraude o error humano.
     */
    t.json('metadata').notNullable();

    t.check(`"account_type" IN ('BANK', 'CASH')`, [], 'accounts_type_check');
    t.check(
      `"category_type" IN ('INCOME', 'EXPENSE')`,
      [],
      'categories_type_check',
    );
  });
}

export async function down(knex: Knex): Promise<void> {}
