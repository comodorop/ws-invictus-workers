import { Knex } from 'knex';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración para el CLI de Knex.
 *
 * Este archivo lo usa la CLI para crear nuevas migraciones:
 *   npm run migrate:make -- nombre_migracion
 *
 * Crea el archivo en src/database/migrations/ con el prefijo de timestamp.
 *
 * IMPORTANTE: Este knexfile apunta a la DB maestra (schema public).
 * En runtime, cada tenant usa su propia instancia Knex con su schema.
 * Las migraciones se corren por tenant desde TenantConnectionService.
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
  migrations: {
    // Directorio donde se guardan y buscan las migraciones
    directory: join(__dirname, 'src/database/migrations'),
    // Extensión de los archivos generados por migrate:make
    extension: 'ts',
    // Nombre de la tabla de tracking (se crea en cada schema de tenant)
    tableName: 'knex_migrations',
  },
};

export default config;
