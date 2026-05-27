import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../middleware/tenant.middleware';

/**
 * Decorador @Tenant() para inyectar el tenantId en controladores.
 *
 * Uso:
 *   @Get('hello')
 *   greet(@Tenant() tenantId: string) {
 *     return this.helloService.greet(tenantId);
 *   }
 */
export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantId;
  },
);
