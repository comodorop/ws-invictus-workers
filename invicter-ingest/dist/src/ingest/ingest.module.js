"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestModule = void 0;
const common_1 = require("@nestjs/common");
const ingest_controller_1 = require("./ingest.controller");
const ingest_excel_service_1 = require("./ingest-excel.service");
const gcp_storage_service_1 = require("../utils/gcp.storage.service");
const rabbitmq_service_1 = require("../utils/rabbitmq.service");
const ingest_service_1 = require("./ingest.service");
const movement_repository_1 = require("./movement.repository");
const movement_mapper_1 = require("./mappers/movement.mapper");
const ingest_excel_consumer_1 = require("./worker/ingest-excel.consumer");
const movementIngestFile_repository_1 = require("./movementIngestFile.repository");
let IngestModule = class IngestModule {
};
exports.IngestModule = IngestModule;
exports.IngestModule = IngestModule = __decorate([
    (0, common_1.Module)({
        controllers: [ingest_controller_1.IngestController, ingest_excel_consumer_1.IngestExcelConsumer],
        providers: [
            ingest_excel_service_1.IngestExcelService,
            ingest_service_1.IngestService,
            gcp_storage_service_1.GcpStorageService,
            rabbitmq_service_1.RabbitMQService,
            movement_repository_1.IngestRepository,
            movementIngestFile_repository_1.MovementIngestFileRepository,
            movement_mapper_1.MovementMapper,
        ],
    })
], IngestModule);
//# sourceMappingURL=ingest.module.js.map