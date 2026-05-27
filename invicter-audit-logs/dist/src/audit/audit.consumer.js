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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const audit_repository_1 = require("./audit.repository");
let AuditConsumer = AuditConsumer_1 = class AuditConsumer {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(AuditConsumer_1.name);
    }
    async handleAuditLog(payload, context) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            await this.auditRepo.create(payload.data);
            this.logger.log(`Audit log guardado: ${payload.data.action} sobre ${payload.data.resource_type}`);
            channel.ack(originalMsg);
        }
        catch (error) {
            this.logger.error(`Error al insertar log de auditoría: ${error.message}`);
            channel.nack(originalMsg, false, false);
        }
    }
};
exports.AuditConsumer = AuditConsumer;
__decorate([
    (0, microservices_1.EventPattern)('log_audit'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], AuditConsumer.prototype, "handleAuditLog", null);
exports.AuditConsumer = AuditConsumer = AuditConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [audit_repository_1.AuditRepository])
], AuditConsumer);
//# sourceMappingURL=audit.consumer.js.map