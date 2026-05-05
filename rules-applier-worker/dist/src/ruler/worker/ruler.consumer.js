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
var RulerConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulerConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const ruler_service_1 = require("../ruler.service");
let RulerConsumer = RulerConsumer_1 = class RulerConsumer {
    constructor(rulerService) {
        this.rulerService = rulerService;
        this.logger = new common_1.Logger(RulerConsumer_1.name);
    }
    async handleRulerJob(data, context) {
        console.log('Recibido ruler job:', data);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            console.log('Enviando email...');
            const r = await this.rulerService.applyRules(data);
            console.log('Email enviado:', r);
            channel.ack(originalMsg);
        }
        catch (error) {
            this.logger.error(`Error en el worker de rules-applier-worker: ${error.message}`);
            channel.nack(originalMsg, false, false);
        }
    }
};
exports.RulerConsumer = RulerConsumer;
__decorate([
    (0, microservices_1.EventPattern)('permisive_rules'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], RulerConsumer.prototype, "handleRulerJob", null);
exports.RulerConsumer = RulerConsumer = RulerConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ruler_service_1.RulerService])
], RulerConsumer);
//# sourceMappingURL=ruler.consumer.js.map