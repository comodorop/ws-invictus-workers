import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

/**
 * Endpoints de gestión de tenants.
 *
 * POST   /tenants            → Registra tenant + migraciones automáticas
 * GET    /tenants            → Lista todos los tenants
 * POST   /tenants/:id/migrate → Aplica migraciones pendientes a un tenant
 * DELETE /tenants/:id        → Elimina tenant y su schema
 */
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  register(@Body() dto: CreateTenantDto) {
    return this.tenantsService.register(dto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  /**
   * Corre las migraciones pendientes sobre un tenant ya existente.
   * Útil cuando despliegas una migración nueva sin volver a registrar el tenant.
   *
   * Knex lleva el tracking interno (knex_migrations en el schema del tenant),
   * así que solo aplica las migraciones que aún no han corrido.
   */
  @Post(':id/migrate')
  migrate(@Param('id') id: string) {
    return this.tenantsService.migrate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
