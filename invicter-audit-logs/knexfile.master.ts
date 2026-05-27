import { Knex } from 'knex';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Knexfile para la base de datos MAESTRA (schema public).
 *
 * Aqui van las tablas del sistema: tenants, users_master, etc.
 * Son tablas globales, NO son por tenant.
 *
 * Comandos disponibles:
 *   npm run migrate:master:latest   → aplica todas las pendientes
 *   npm run migrate:master:rollback → revierte la ultima
 *   npm run migrate:master:make -- nombre → crea un archivo nuevo
 *   npm run migrate:master:list     → muestra el estado actual
 *
 * El tracking se guarda en la tabla "knex_migrations_master" (schema public).
 * Esto la diferencia del tracking de tenants ("knex_migrations" en cada schema).
 */
const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'invicter',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  searchPath: ['public'],
  migrations: {
    directory: join(__dirname, 'src/database/migrations-master'),
    extension: 'ts',
    tableName: 'knex_migrations_master',
  },
};

export default config;
