import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
export interface TenantRecord {
    id: string;
    name: string;
    subdomain: string;
    schema: string;
    plan: 'free' | 'pro';
    db_host: string | null;
    db_port: number | null;
    db_name: string | null;
    db_user: string | null;
    db_password: string | null;
    created_at: Date;
}
export interface RegisterTenantData {
    name: string;
    subdomain?: string;
    plan?: 'free' | 'pro';
    db_host?: string;
    db_port?: number;
    db_name?: string;
    db_user?: string;
    db_password?: string;
    db_schema?: string;
}
export declare class TenantConnectionService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly connections;
    private master;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getConnection(tenantId: string): Promise<Knex>;
    getMaster(): Knex;
    findBySubdomain(subdomain: string): Promise<TenantRecord | null>;
    registerTenant(data: RegisterTenantData): Promise<TenantRecord>;
    removeTenant(tenantId: string): Promise<void>;
    private buildSharedKnex;
    private buildExternalKnex;
    private resolveKnex;
    private preloadConnections;
    private runMigrations;
    migrateExistingTenant(tenantId: string): Promise<{
        applied: string[];
    }>;
    private findTenantOrFail;
    private slugify;
}
