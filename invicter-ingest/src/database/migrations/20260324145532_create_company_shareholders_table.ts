import { Knex } from 'knex';

/*
Roles para company_shareholders (Relación de Propiedad)

    FOUNDER (Socio Fundador)

        Lógica: Son los dueños originales.

        Para qué sirve: En los dashboards, te permite agrupar el "Capital Semilla" o el control original. Legalmente, suelen tener derechos de voto preferente o cláusulas de no competencia más estrictas.

    CAPITAL_PARTNER (Socio Capitalista)

        Lógica: Inversionista puro. Solo puso dinero y espera dividendos.

        Para qué sirve: Para el SAT y reportes financieros, estos socios no generan gastos de nómina, solo utilidades. Es el rol estándar para inversionistas ángel o fondos.

    OPERATING_PARTNER (Socio Operador)

        Lógica: Tiene acciones pero también trabaja en la empresa (ej. el CTO que es socio).

        Para qué sirve: Fiscalmente es vital porque este socio probablemente recibe un sueldo (gastos) y además dividendos. Tu sistema puede cruzar esta info con la tabla de movimientos para ver cuánto "le cuesta" realmente este socio a la empresa.

    MANAGING_PARTNER (Socio Administrador)

        Lógica: Es dueño y además tiene el poder legal de la empresa (Firma ante el SAT, bancos, etc.).

        Para qué sirve: Este es el "boss". En tu sistema, este rol debería ser el que tiene permisos para subir archivos de la Firma Electrónica (e.firma) o autorizar la descarga masiva de CFDI.

    ADVISOR_SHAREHOLDER (Consejero con Acciones)

        Lógica: Mentores o consejeros que recibieron un porcentaje pequeño (0.5% - 2%) por su ayuda.

        Para qué sirve: Normalmente estas acciones están sujetas a Vesting (se las ganan con el tiempo). Tener este rol te permite poner una bandera en el sistema: "Ojo, estas acciones no se pueden vender hasta tal fecha".
*/

export async function up(knex: Knex): Promise<void> {
  const schema = 't_free';

  await knex.schema
    .withSchema(schema)
    .createTable('company_shareholders', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Relación a la Empresa
      t.uuid('company_id')
        .notNullable()
        .references('id')
        .inTable(`${schema}.companies`)
        .onDelete('CASCADE');

      // Relación al Perfil del Inversionista
      t.uuid('investor_profile_id')
        .notNullable()
        .references('id')
        .inTable(`${schema}.investor_profiles`)
        .onDelete('CASCADE');

      // Datos de la relación
      t.decimal('share_percentage', 5, 2).notNullable();
      t.string('role', 50)
        .defaultTo('CAPITAL_PARTNER')
        .checkIn([
          'FOUNDER',
          'CAPITAL_PARTNER',
          'OPERATING_PARTNER',
          'MANAGING_PARTNER',
          'ADVISOR_SHAREHOLDER',
        ]);
      t.date('investment_date').defaultTo(knex.fn.now());

      t.timestamps(true, true);

      // Restricciones
      t.unique(['company_id', 'investor_profile_id'], {
        indexName: 'uq_company_investor',
      });
      t.check(
        'share_percentage > 0 AND share_percentage <= 100',
        [],
        'share_percentage_check',
      );
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema('t_free')
    .dropTableIfExists('company_shareholders');
}
