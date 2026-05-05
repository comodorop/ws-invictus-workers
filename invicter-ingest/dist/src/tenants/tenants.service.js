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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
const tenants_repository_1 = require("./tenants.repository");
let TenantsService = class TenantsService {
    constructor(tenantConn, tenantsRepo) {
        this.tenantConn = tenantConn;
        this.tenantsRepo = tenantsRepo;
    }
    async register(dto) {
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
    async findAll() {
        return this.tenantsRepo.findAll();
    }
    async migrate(tenantId) {
        return this.tenantConn.migrateExistingTenant(tenantId);
    }
    async remove(tenantId) {
        await this.tenantConn.removeTenant(tenantId);
        return { deleted: true };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService,
        tenants_repository_1.TenantsRepository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map