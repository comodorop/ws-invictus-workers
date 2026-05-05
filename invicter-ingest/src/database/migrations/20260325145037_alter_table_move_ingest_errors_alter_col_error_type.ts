import type { Knex } from 'knex';

exports.up = async function (knex: Knex) {
  await knex.schema.alterTable('movement_ingest_errors', (table) => {
    table.jsonb('error_type').alter();
  });
};

exports.down = async function (knex: Knex) {
  await knex.schema.alterTable('movement_ingest_errors', (table) => {
    table.string('error_type', 50).alter();
  });
};
