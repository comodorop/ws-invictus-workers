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
exports.TenantsRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
let TenantsRepository = class TenantsRepository {
    constructor(tenantConn) {
        this.tenantConn = tenantConn;
    }
    async findAll() {
        return this.tenantConn
            .getMaster()('tenants')
            .select('id', 'name', 'subdomain', 'plan', 'db_host', 'db_port', 'db_name', 'db_user', 'created_at')
            .orderBy('created_at', 'desc');
    }
};
exports.TenantsRepository = TenantsRepository;
exports.TenantsRepository = TenantsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], TenantsRepository);
//# sourceMappingURL=tenants.repository.js.map