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
var EmailConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const mailer_service_1 = require("../mailer.service");
let EmailConsumer = EmailConsumer_1 = class EmailConsumer {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(EmailConsumer_1.name);
    }
    async handleEmailJob(data, context) {
        console.log('Recibido email job:', data);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            if (!data.to || !data.subject || !data.message) {
                this.logger.warn('Mensaje de email mal formado, descartando...');
                return channel.ack(originalMsg);
            }
            console.log('Enviando email...');
            const r = await this.mailerService.send(data.to, data.subject, data.message, data.type || 'html', data.fromName);
            console.log('Email enviado:', r);
            channel.ack(originalMsg);
        }
        catch (error) {
            this.logger.error(`Error en el worker de email: ${error.message}`);
            channel.nack(originalMsg, false, false);
        }
    }
};
exports.EmailConsumer = EmailConsumer;
__decorate([
    (0, microservices_1.EventPattern)('send_email_queue'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], EmailConsumer.prototype, "handleEmailJob", null);
exports.EmailConsumer = EmailConsumer = EmailConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [mailer_service_1.MailerService])
], EmailConsumer);
//# sourceMappingURL=mailer.consumer.js.map