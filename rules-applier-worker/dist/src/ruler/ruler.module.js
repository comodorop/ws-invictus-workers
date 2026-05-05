"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulerModule = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../utils/rabbitmq.service");
const ruler_consumer_1 = require("./worker/ruler.consumer");
const ruler_service_1 = require("./ruler.service");
const movement_issues_repository_1 = require("../repositories/movement-issues.repository");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
let RulerModule = class RulerModule {
};
exports.RulerModule = RulerModule;
exports.RulerModule = RulerModule = __decorate([
    (0, common_1.Module)({
        controllers: [ruler_consumer_1.RulerConsumer],
        providers: [
            rabbitmq_service_1.RabbitMQService,
            ruler_service_1.RulerService,
            movement_issues_repository_1.MovementIssuesRepository,
            tenant_connection_service_1.TenantConnectionService,
        ],
    })
], RulerModule);
//# sourceMappingURL=ruler.module.js.map