import { Injectable } from '@nestjs/common';
import {
  TenantConnectionService,
  TenantRecord,
} from '../database/tenant-connection.service';

@Injectable()
export class TenantsRepository {
  constructor(private readonly tenantConn: TenantConnectionService) {}

  async findAll(): Promise<Omit<TenantRecord, 'schema' | 'db_password'>[]> {
    return this.tenantConn
      .getMaster()<Omit<TenantRecord, 'schema' | 'db_password'>>('tenants')
      .select(
        'id',
        'name',
        'subdomain',
        'plan',
        'db_host',
        'db_port',
        'db_name',
        'db_user',
        'created_at',
      )
      .orderBy('created_at', 'desc');
  }
}
