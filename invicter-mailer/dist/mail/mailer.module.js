"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailModule = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../utils/rabbitmq.service");
const mailer_consumer_1 = require("./worker/mailer.consumer");
const mailer_service_1 = require("./mailer.service");
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Module)({
        controllers: [mailer_consumer_1.EmailConsumer],
        providers: [
            rabbitmq_service_1.RabbitMQService,
            mailer_service_1.MailerService,
        ],
    })
], MailModule);
//# sourceMappingURL=mailer.module.js.map