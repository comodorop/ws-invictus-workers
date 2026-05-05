"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantConnectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConnectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const knex_1 = require("knex");
const path_1 = require("path");
let TenantConnectionService = TenantConnectionService_1 = class TenantConnectionService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(TenantConnectionService_1.name);
        this.connections = new Map();
    }
    async onModuleInit() {
        this.master = this.buildSharedKnex('public');
        await this.preloadConnections();
        this.logger.log('TenantConnectionService initialized');
    }
    async onModuleDestroy() {
        for (const [id, conn] of this.connections) {
            await conn.destroy();
            this.logger.debug(`Connection closed → tenant: ${id}`);
        }
        await this.master.destroy();
    }
    async getConnection(tenantId) {
        if (this.connections.has(tenantId)) {
            return this.connections.get(tenantId);
        }
        const tenant = await this.findTenantOrFail(tenantId);
        const conn = this.resolveKnex(tenant);
        this.connections.set(tenantId, conn);
        this.logger.log(`New connection created → tenant: ${tenantId}`);
        return conn;
    }
    getMaster() {
        return this.master;
    }
    async findBySubdomain(subdomain) {
        const tenant = await this.master('tenants')
            .where({ subdomain })
            .first();
        return tenant ?? null;
    }
    async registerTenant(data) {
        const id = this.slugify(data.name);
        const isByodb = !!data.db_host;
        const isPro = data.plan === 'pro';
        const schema = isByodb
            ? (data.db_schema ?? 'public')
            : isPro
                ? `t_${id}`
                : 't_free';
        const subdomain = data.subdomain ?? id;
        const [tenant] = await this.master('tenants')
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
        let conn;
        if (isByodb) {
            conn = this.buildExternalKnex(tenant);
            this.logger.log(`BYODB → tenant: ${id} @ ${data.db_host}/${data.db_name}`);
        }
        else {
            await this.master.raw(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
            this.logger.log(isPro
                ? `Schema dedicado "${schema}" creado para tenant: ${id}`
                : `Tenant "${id}" asignado al schema compartido "t_free"`);
            conn = this.buildSharedKnex(schema);
        }
        await this.runMigrations(conn, id);
        this.connections.set(id, conn);
        this.logger.log(`Tenant "${id}" registered ✓ (${isByodb ? 'BYODB' : 'shared DB'})`);
        return tenant;
    }
    async removeTenant(tenantId) {
        const tenant = await this.findTenantOrFail(tenantId);
        const conn = this.connections.get(tenantId);
        if (conn) {
            await conn.destroy();
            this.connections.delete(tenantId);
        }
        if (!tenant.db_host) {
            if (tenant.schema === 't_free') {
                const freeConn = this.buildSharedKnex('t_free');
                await freeConn('greetings').where({ tenant_id: tenantId }).delete();
                await freeConn('users').where({ tenant_id: tenantId }).delete();
                await freeConn.destroy();
                this.logger.log(`Filas del tenant "${tenantId}" eliminadas de t_free`);
            }
            else {
                await this.master.raw(`DROP SCHEMA IF EXISTS "${tenant.schema}" CASCADE`);
                this.logger.log(`Schema "${tenant.schema}" eliminado`);
            }
        }
        await this.master('tenants').where({ id: tenantId }).delete();
        this.logger.log(`Tenant "${tenantId}" removed`);
    }
    buildSharedKnex(schema) {
        return (0, knex_1.default)({
            client: 'pg',
            connection: {
                host: this.config.get('DB_HOST', 'localhost'),
                port: this.config.get('DB_PORT', 5432),
                database: this.config.get('DB_NAME', 'master_db'),
                user: this.config.get('DB_USER', 'postgres'),
                password: this.config.get('DB_PASSWORD', 'postgres'),
            },
            searchPath: [schema],
            pool: { min: 1, max: 5 },
        });
    }
    buildExternalKnex(tenant) {
        return (0, knex_1.default)({
            client: 'pg',
            connection: {
                host: tenant.db_host,
                port: tenant.db_port ?? 5432,
                database: tenant.db_name,
                user: tenant.db_user,
                password: tenant.db_password,
            },
            searchPath: [tenant.schema],
            pool: { min: 1, max: 5 },
        });
    }
    resolveKnex(tenant) {
        return tenant.db_host
            ? this.buildExternalKnex(tenant)
            : this.buildSharedKnex(tenant.schema);
    }
    async preloadConnections() {
        const tenants = await this.master('tenants').select('*');
        for (const t of tenants) {
            const conn = this.resolveKnex(t);
            this.connections.set(t.id, conn);
        }
        this.logger.log(`Preloaded ${tenants.length} tenant connection(s)`);
    }
    async runMigrations(conn, tenantId) {
        this.logger.log(`Running migrations for tenant "${tenantId}"...`);
        const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
        const [batchNo, applied] = await conn.migrate.latest({
            directory: (0, path_1.join)(__dirname, 'migrations'),
            loadExtensions: [ext],
            tableName: 'knex_migrations',
        });
        if (applied.length === 0) {
            this.logger.log(`Tenant "${tenantId}" — already up to date`);
        }
        else {
            this.logger.log(`Tenant "${tenantId}" — batch ${batchNo}: ${applied.length} migration(s) applied ✓`);
            applied.forEach((m) => this.logger.debug(`  ↳ ${m}`));
        }
    }
    async migrateExistingTenant(tenantId) {
        const conn = await this.getConnection(tenantId);
        const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
        const [, applied] = await conn.migrate.latest({
            directory: (0, path_1.join)(__dirname, 'migrations'),
            loadExtensions: [ext],
            tableName: 'knex_migrations',
        });
        this.logger.log(`migrateExistingTenant "${tenantId}" — ${applied.length} applied`);
        return { applied };
    }
    async findTenantOrFail(tenantId) {
        const tenant = await this.master('tenants')
            .where({ id: tenantId })
            .first();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant "${tenantId}" not found`);
        }
        return tenant;
    }
    slugify(name) {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/, '');
        return `${base}_${Date.now().toString(36)}`;
    }
};
exports.TenantConnectionService = TenantConnectionService;
exports.TenantConnectionService = TenantConnectionService = TenantConnectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TenantConnectionService);
//# sourceMappingURL=tenant-connection.service.js.map