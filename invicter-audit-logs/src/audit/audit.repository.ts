// src/audit/audit.repository.ts
import { Injectable } from '@nestjs/common';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { AuditLogEntry } from './audit.types';

@Injectable()
export class AuditRepository {
  // Usamos tu servicio de conexiones en lugar de un decorador externo
  constructor(private readonly tenantConn: TenantConnectionService) {}

  async create(data: AuditLogEntry) {
    // Para auditoría, usamos la conexión base (public)
    // Asumiendo que tu servicio permite obtener la conexión 'free' o 'public'
    const db = await this.tenantConn.getConnection('free');
    console.log('data', data);
    const [log] = await db('audit_logs')
      .insert({
        user_id: data.user_id,
        user_email: data.user_email,
        action: data.action,
        resource_type: data.resource_type,
        resource_id: data.resource_id?.toString(),
        new_values: data.new_values ? JSON.stringify(data.new_values) : null,
        created_at: new Date(),
      })
      .returning('*');

    return log;
  }
}