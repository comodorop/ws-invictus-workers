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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../../database/tenant-connection.service");
let TenantMiddleware = class TenantMiddleware {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async use(req, _res, next) {
        let tenantId;
        const headerTenantId = req.headers['x-tenant-id'];
        if (headerTenantId) {
            tenantId = headerTenantId;
        }
        else {
            const subdomain = req.hostname?.split('.')[0];
            if (subdomain && subdomain !== 'localhost') {
                const tenant = await this.tenantService.findBySubdomain(subdomain);
                tenantId = tenant?.id;
            }
        }
        if (!tenantId) {
            throw new common_1.NotFoundException('No se pudo identificar el tenant. ' +
                'Envía el header X-Tenant-ID o usa un subdominio válido.');
        }
        try {
            await this.tenantService.getConnection(tenantId);
        }
        catch {
            throw new common_1.NotFoundException(`Tenant "${tenantId}" no encontrado.`);
        }
        req.tenantId = tenantId;
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map