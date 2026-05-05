import { Injectable } from '@nestjs/common';
import {
  TenantConnectionService,
  TenantRecord,
} from '../database/tenant-connection.service';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantConn: TenantConnectionService,
    private readonly tenantsRepo: TenantsRepository,
  ) {}

  /**
   * Registra un cliente nuevo:
   *  - Crea el schema de Postgres
   *  - Ejecuta las migraciones automáticamente
   *  - Devuelve los datos del tenant creado
   */
  async register(dto: CreateTenantDto): Promise<TenantRecord> {
    return this.tenantConn.registerTenant({
      name: dto.name,
      subdomain: dto.subdomain,
      plan: dto.plan,
      db_host: dto.db_host,
      db_port: dto.db_port,
      db_name: dto.db_name,
      db_user: dto.db_user,
      db_password: dto.db_password,
      db_schema: dto.db_schema,
    });
  }

  /** Lista todos los tenants registrados (sin schema ni db_password). */
  async findAll(): Promise<Omit<TenantRecord, 'schema' | 'db_password'>[]> {
    return this.tenantsRepo.findAll();
  }

  /**
   * Ejecuta las migraciones pendientes sobre un tenant ya existente.
   * Útil al desplegar una migración nueva sin volver a registrar el tenant.
   */
  async migrate(tenantId: string): Promise<{ applied: string[] }> {
    return this.tenantConn.migrateExistingTenant(tenantId);
  }

  /** Elimina un tenant y su schema completo. */
  async remove(tenantId: string): Promise<{ deleted: boolean }> {
    await this.tenantConn.removeTenant(tenantId);
    return { deleted: true };
  }
}
