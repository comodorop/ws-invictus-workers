import { Knex } from 'knex';

/*
Tipos de Entidad para investor_profiles (Naturaleza Jurídica)

    INDIVIDUAL_MX (Persona Física Nacional)

        Lógica: Persona física con residencia fiscal en México.

        Para qué sirve: El sistema habilita y valida campos obligatorios como el RFC (13 dígitos) y la CURP. Fiscalmente, es el sujeto estándar para el reporte de dividendos a individuos y su correspondiente retención de ISR local.

    ENTITY_MX (Persona Moral Nacional)

        Lógica: Empresa, institución o holding constituida legalmente en México.

        Para qué sirve: El sistema valida un RFC de 12 dígitos y solicita Razón Social en lugar de nombres/apellidos. Permite aplicar reglas de CUFIN (Cuenta de Utilidad Fiscal Neta) para evitar la doble tributación cuando el dinero se mueve entre empresas mexicanas.

    INDIVIDUAL_FOREIGN (Persona Física Extranjera)

        Lógica: Inversionista persona física que reside fuera del territorio mexicano.

        Para qué sirve: Elimina la obligatoriedad del RFC/CURP y habilita el campo "Tax ID" (Número de identificación fiscal extranjero) y país de residencia. Activa automáticamente las alertas de retención de ISR para extranjeros bajo los tratados para evitar la doble imposición.

    ENTITY_FOREIGN (Persona Moral Extranjera)

        Lógica: Fondo de inversión, matriz o empresa constituida en el extranjero.

        Para qué sirve: Identifica entidades que invierten capital foráneo. Es crucial para el cumplimiento de reportes de inversión extranjera y para asegurar que las tasas de retención aplicadas a los dividendos internacionales cumplan con la normativa fiscal vigente.
*/

export async function up(knex: Knex): Promise<void> {
  const schema = 't_free';

  await knex.schema.withSchema(schema).createTable('investor_profiles', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Vinculación con el usuario del sistema
    t.string('user_id', 255).notNullable().unique();

    // Datos específicos de perfil de inversionista
    t.string('tax_id', 20).nullable(); // RFC en México
    t.string('legal_name', 255).notNullable();
    t.enum('investor_type', [
      'INDIVIDUAL_MX',
      'ENTITY_MX',
      'INDIVIDUAL_FOREIGN',
      'ENTITY_FOREIGN',
    ]).defaultTo('INDIVIDUAL_MX');

    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('t_free').dropTableIfExists('investor_profiles');
}
