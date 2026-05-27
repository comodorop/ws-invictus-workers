import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantConnectionService } from '../../database/tenant-connection.service';

export interface TenantRequest extends Request {
  tenantId: string;
}

/**
 * Middleware de resolución de tenant.
 *
 * Soporta dos estrategias en orden de prioridad:
 *
 *  1. Header X-Tenant-ID  → útil en desarrollo, Postman, API-to-API.
 *                           Ejemplo: X-Tenant-ID: acme_corp_lk7f2
 *
 *  2. Subdominio del host → para producción con dominios por cliente.
 *                           Ejemplo: acme.tuapp.com resuelve al tenant
 *                           cuyo campo "subdomain" sea "acme".
 *
 * Si ninguno resuelve → 404.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantConnectionService) {}

  async use(req: TenantRequest, _res: Response, next: NextFunction) {
    let tenantId: string | undefined;

    // ── Prioridad 1: header explícito ──────────────────────────────────────
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenantId) {
      tenantId = headerTenantId;
    } else {
      // ── Prioridad 2: subdominio del host ─────────────────────────────────
      // req.hostname puede ser "acme.tuapp.com" → extrae "acme"
      // Ignora "localhost" para no romper el entorno de desarrollo sin header
      const subdomain = req.hostname?.split('.')[0];
      if (subdomain && subdomain !== 'localhost') {
        const tenant = await this.tenantService.findBySubdomain(subdomain);
        tenantId = tenant?.id;
      }
    }

    if (!tenantId) {
      throw new NotFoundException(
        'No se pudo identificar el tenant. ' +
          'Envía el header X-Tenant-ID o usa un subdominio válido.',
      );
    }

    // Valida existencia y crea/recupera conexión del cache
    try {
      await this.tenantService.getConnection(tenantId);
    } catch {
      throw new NotFoundException(`Tenant "${tenantId}" no encontrado.`);
    }

    req.tenantId = tenantId;
    next();
  }
}
