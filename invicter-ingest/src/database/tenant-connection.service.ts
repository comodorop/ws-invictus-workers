import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { join } from 'path';

export interface TenantRecord {
  id: string;
  name: string;
  /** Subdominio único usado para host-based routing (ej: "acme" → acme.tuapp.com) */
  subdomain: string;
  /** Schema de Postgres donde viven las tablas del tenant */
  schema: string;
  plan: 'free' | 'pro';
  // ── BYODB (Bring Your Own Database) ──────────────────────────────────────
  // Null cuando el tenant usa la DB compartida del servidor.
  // Rellenados cuando el tenant pro provee su propia base de datos.
  db_host: string | null;
  db_port: number | null;
  db_name: string | null;
  db_user: string | null;
  db_password: string | null; // En producción: encriptar con vault/KMS
  created_at: Date;
}

export interface RegisterTenantData {
  name: string;
  subdomain?: string;
  plan?: 'free' | 'pro';
  // Credenciales opcionales para BYODB
  db_host?: string;
  db_port?: number;
  db_name?: string;
  db_user?: string;
  db_password?: string;
  db_schema?: string; // Schema dentro de su DB (default: 'public')
}

/**
 * Servicio central del sistema multitenant.
 *
 * Soporta dos modos de conexión:
 *
 *  1. DB compartida  → Un solo Postgres, schemas separados por tenant (t_<id>)
 *                      Ideal para planes free/básico.
 *
 *  2. BYODB          → El tenant pro provee sus propias credenciales de Postgres.
 *                      La app se conecta a su DB y ejecuta migraciones ahí.
 *                      El servidor no gestiona ni elimina su DB.
 *
 * Soporta dos modos de identificación del tenant:
 *
 *  A. Header X-Tenant-ID  → directo por ID (dev, API-to-API)
 *  B. Subdominio del host → acme.tuapp.com resuelve al tenant con subdomain="acme"
 */
@Injectable()
export class TenantConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionService.name);

  /** Cache de conexiones activas. Key = tenantId */
  private readonly connections = new Map<string, Knex>();

  /** Conexión a la DB compartida maestra (schema public) */
  private master: Knex;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.master = this.buildSharedKnex('public');
    await this.preloadConnections();
    this.logger.log('TenantConnectionService initialized');
  }

  async onModuleDestroy(): Promise<void> {
    for (const [id, conn] of this.connections) {
      await conn.destroy();
      this.logger.debug(`Connection closed → tenant: ${id}`);
    }
    await this.master.destroy();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos públicos
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Devuelve la conexión Knex del tenant (shared o external).
   * Si no está en cache la crea dinámicamente sin reiniciar el servicio.
   */
  async getConnection(tenantId: string): Promise<Knex> {
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    const tenant = await this.findTenantOrFail(tenantId);
    const conn = this.resolveKnex(tenant);
    this.connections.set(tenantId, conn);
    this.logger.log(`New connection created → tenant: ${tenantId}`);
    return conn;
  }

  /** Conexión maestra (tabla de tenants en schema public). */
  getMaster(): Knex {
    return this.master;
  }

  /**
   * Busca un tenant por su subdominio.
   * Usado por el middleware en modo host-based routing.
   */
  async findBySubdomain(subdomain: string): Promise<TenantRecord | null> {
    const tenant = await this.master<TenantRecord>('tenants')
      .where({ subdomain })
      .first();
    return tenant ?? null;
  }

  /**
   * Registra un tenant nuevo y ejecuta las migraciones automáticamente.
   *
   * Plan free (sin db_host):
   *   - Todos comparten el schema "t_free"
   *   - Las tablas tienen columna tenant_id para aislar datos por fila
   *
   * Plan pro (sin db_host):
   *   - Schema dedicado "t_<id>" solo para él
   *
   * BYODB (con db_host):
   *   - Se conecta a la DB del cliente con sus credenciales
   *   - El servidor NUNCA toca ni elimina su DB
   */
  async registerTenant(data: RegisterTenantData): Promise<TenantRecord> {
    const id = this.slugify(data.name);
    const isByodb = !!data.db_host;
    const isPro = data.plan === 'pro';
    // Free → schema compartido "t_free"
    // Pro  → schema dedicado   "t_<id>"
    // BYODB → schema que el cliente indique (default: public)
    const schema = isByodb
      ? (data.db_schema ?? 'public')
      : isPro
        ? `t_${id}`
        : 't_free';
    const subdomain = data.subdomain ?? id;

    // 1. Insertar en tabla maestra
    const [tenant] = await this.master<TenantRecord>('tenants')
      .insert({
        id,
        name: data.name,
        subdomain,
        schema,
        plan: data.plan ?? 'free',
        db_host: data.db_host ?? null,
        db_port: data.db_port ?? null,
        db_name: data.db_name ?? null,
        db_user: data.db_user ?? null,
        db_password: data.db_password ?? null,
      })
      .returning('*');

    let conn: Knex;

    if (isByodb) {
      // BYODB: conectar directamente a su DB, sin tocar la shared
      conn = this.buildExternalKnex(tenant);
      this.logger.log(
        `BYODB → tenant: ${id} @ ${data.db_host}/${data.db_name}`,
      );
    } else {
      // Shared DB: crear schema si no existe (t_free ya puede existir, IF NOT EXISTS es seguro)
      await this.master.raw(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      this.logger.log(
        isPro
          ? `Schema dedicado "${schema}" creado para tenant: ${id}`
          : `Tenant "${id}" asignado al schema compartido "t_free"`,
      );
      conn = this.buildSharedKnex(schema);
    }

    // En ambos casos: correr migraciones en la DB destino
    await this.runMigrations(conn, id);
    this.connections.set(id, conn);

    this.logger.log(
      `Tenant "${id}" registered ✓ (${isByodb ? 'BYODB' : 'shared DB'})`,
    );
    return tenant;
  }

  /**
   * Elimina un tenant.
   *
   * - Free (schema t_free compartido): elimina solo las filas del tenant.
   *   NUNCA elimina el schema porque otros tenants free viven ahí.
   *
   * - Pro (schema dedicado t_<id>): elimina el schema completo (DROP CASCADE).
   *
   * - BYODB: solo elimina el registro en la tabla maestra.
   *          NO toca la DB del cliente.
   */
  async removeTenant(tenantId: string): Promise<void> {
    const tenant = await this.findTenantOrFail(tenantId);

    const conn = this.connections.get(tenantId);
    if (conn) {
      await conn.destroy();
      this.connections.delete(tenantId);
    }

    if (!tenant.db_host) {
      if (tenant.schema === 't_free') {
        // Schema compartido: borrar solo las filas de este tenant
        const freeConn = this.buildSharedKnex('t_free');
        await freeConn('greetings').where({ tenant_id: tenantId }).delete();
        await freeConn('users').where({ tenant_id: tenantId }).delete();
        await freeConn.destroy();
        this.logger.log(`Filas del tenant "${tenantId}" eliminadas de t_free`);
      } else {
        // Schema dedicado (pro): eliminar schema completo
        await this.master.raw(
          `DROP SCHEMA IF EXISTS "${tenant.schema}" CASCADE`,
        );
        this.logger.log(`Schema "${tenant.schema}" eliminado`);
      }
    }
    // BYODB: no hacemos nada en su DB

    await this.master('tenants').where({ id: tenantId }).delete();
    this.logger.log(`Tenant "${tenantId}" removed`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos privados
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Knex apuntando a un schema de la DB compartida del servidor.
   * Usa las vars de entorno DB_HOST, DB_PORT, etc.
   */
  private buildSharedKnex(schema: string): Knex {
    return knex({
      client: 'pg',
      connection: {
        host: this.config.get<string>('DB_HOST', 'localhost'),
        port: this.config.get<number>('DB_PORT', 5432),
        database: this.config.get<string>('DB_NAME', 'master_db'),
        user: this.config.get<string>('DB_USER', 'postgres'),
        password: this.config.get<string>('DB_PASSWORD', 'postgres'),
      },
      searchPath: [schema],
      pool: { min: 1, max: 5 },
    });
  }

  /**
   * Knex apuntando a la DB propia del tenant (BYODB).
   * Usa las credenciales que el cliente proveyó al registrarse.
   */
  private buildExternalKnex(tenant: TenantRecord): Knex {
    return knex({
      client: 'pg',
      connection: {
        host: tenant.db_host!,
        port: tenant.db_port ?? 5432,
        database: tenant.db_name!,
        user: tenant.db_user!,
        password: tenant.db_password!,
      },
      searchPath: [tenant.schema],
      pool: { min: 1, max: 5 },
    });
  }

  /** Elige qué Knex usar según el tipo de DB del tenant. */
  private resolveKnex(tenant: TenantRecord): Knex {
    return tenant.db_host
      ? this.buildExternalKnex(tenant)
      : this.buildSharedKnex(tenant.schema);
  }

  private async preloadConnections(): Promise<void> {
    const tenants = await this.master<TenantRecord>('tenants').select('*');
    for (const t of tenants) {
      const conn = this.resolveKnex(t);
      this.connections.set(t.id, conn);
    }
    this.logger.log(`Preloaded ${tenants.length} tenant connection(s)`);
  }

  /**
   * Ejecuta las migraciones pendientes usando el sistema nativo de Knex.
   *
   * Knex crea una tabla "knex_migrations" en el schema del tenant para
   * registrar qué migraciones ya corrieron. Llamar este método varias veces
   * es seguro: solo aplica las que aún no han sido ejecutadas.
   *
   * En dev  (__filename termina en .ts) → carga archivos .ts
   * En prod (__filename termina en .js) → carga archivos .js (compilados)
   */
  private async runMigrations(conn: Knex, tenantId: string): Promise<void> {
    this.logger.log(`Running migrations for tenant "${tenantId}"...`);

    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

    const [batchNo, applied] = await conn.migrate.latest({
      directory: join(__dirname, 'migrations'),
      loadExtensions: [ext],
      tableName: 'knex_migrations',
    });

    if (applied.length === 0) {
      this.logger.log(`Tenant "${tenantId}" — already up to date`);
    } else {
      this.logger.log(
        `Tenant "${tenantId}" — batch ${batchNo}: ${applied.length} migration(s) applied ✓`,
      );
      applied.forEach((m: string) => this.logger.debug(`  ↳ ${m}`));
    }
  }

  /**
   * Permite correr migraciones pendientes sobre un tenant ya existente.
   * Útil cuando se agrega una migración nueva y quieres aplicarla
   * a tenants que ya estaban registrados.
   */
  async migrateExistingTenant(
    tenantId: string,
  ): Promise<{ applied: string[] }> {
    const conn = await this.getConnection(tenantId);
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

    const [, applied] = await conn.migrate.latest({
      directory: join(__dirname, 'migrations'),
      loadExtensions: [ext],
      tableName: 'knex_migrations',
    });

    this.logger.log(
      `migrateExistingTenant "${tenantId}" — ${applied.length} applied`,
    );
    return { applied };
  }

  private async findTenantOrFail(tenantId: string): Promise<TenantRecord> {
    const tenant = await this.master<TenantRecord>('tenants')
      .where({ id: tenantId })
      .first();
    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" not found`);
    }
    return tenant;
  }

  private slugify(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/, '');
    return `${base}_${Date.now().toString(36)}`;
  }
}
