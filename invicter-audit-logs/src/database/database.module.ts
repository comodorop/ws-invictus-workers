import { Global, Module } from '@nestjs/common';
import { TenantConnectionService } from './tenant-connection.service';

/**
 * Módulo global: TenantConnectionService disponible en toda la app
 * sin necesidad de importar DatabaseModule en cada módulo.
 */
@Global()
@Module({
  providers: [TenantConnectionService],
  exports: [TenantConnectionService],
})
export class DatabaseModule {}
