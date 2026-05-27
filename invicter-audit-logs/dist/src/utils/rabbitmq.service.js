"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const amqp = require("amqplib");
const dotenv = require("dotenv");
dotenv.config();
let RabbitMQService = class RabbitMQService {
    async onModuleInit() {
        console.log(process.env.RABBITMQ_URL);
        const conn = await amqp.connect(process.env.RABBITMQ_URL ?? '');
        this.channel = await conn.createChannel();
        await this.channel.assertQueue('excel_queue', {
            durable: true,
        });
    }
    async publish(queue, message) {
        if (!this.channel)
            return;
        await this.channel.assertQueue(queue, {
            durable: true,
        });
        const nestJsMessage = {
            pattern: queue,
            data: message,
        };
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(nestJsMessage)), { persistent: true });
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)()
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map