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
exports.AuditRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
let AuditRepository = class AuditRepository {
    constructor(tenantConn) {
        this.tenantConn = tenantConn;
    }
    async create(data) {
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
};
exports.AuditRepository = AuditRepository;
exports.AuditRepository = AuditRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], AuditRepository);
//# sourceMappingURL=audit.repository.js.map