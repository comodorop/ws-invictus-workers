import { Knex } from 'knex';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Knexfile para el schema compartido de tenants FREE (t_free).
 *
 * Este schema se crea una sola vez y lo comparten todos los usuarios
 * de plan free. Los datos se aíslan por la columna tenant_id en cada tabla.
 *
 * Comandos:
 *   npm run migrate:free:latest   → aplica todas las migraciones pendientes en t_free
 *   npm run migrate:free:rollback → revierte la última
 *   npm run migrate:free:list     → muestra el estado actual
 *
 * Para correr TODO desde cero (producción / primer arranque):
 *   npm run setup:db
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
  searchPath: ['t_free'],
  migrations: {
    // Mismas migraciones que usan los tenants (users, greetings, tenant_id, etc.)
    directory: join(__dirname, 'src/database/migrations'),
    extension: 'ts',
    tableName: 'knex_migrations',
  },
};

export default config;
