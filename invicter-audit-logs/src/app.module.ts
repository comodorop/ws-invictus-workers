import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AuditConsumer } from './audit/audit.consumer';
import { AuditRepository } from './audit/audit.repository';

@Module({
  controllers: [AuditConsumer],
  providers: [AuditRepository],
  imports: [
    // ConfigModule lee el archivo .env y expone ConfigService globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    // DatabaseModule es @Global → disponible en toda la app sin importar
    DatabaseModule,
    TenantsModule,
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplica el middleware de tenant SOLO a las rutas que lo necesitan.
    // Las rutas de /tenants son públicas (registro de nuevos clientes).
    consumer.apply(TenantMiddleware).forRoutes('hello');
  }
}
