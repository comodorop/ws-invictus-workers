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
var IngestExcelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestExcelService = void 0;
const common_1 = require("@nestjs/common");
const gcp_storage_service_1 = require("../utils/gcp.storage.service");
const rabbitmq_service_1 = require("../utils/rabbitmq.service");
const movementIngestFile_repository_1 = require("./movementIngestFile.repository");
let IngestExcelService = IngestExcelService_1 = class IngestExcelService {
    constructor(gcpStorage, rabbitMQ, ingestFileRepository) {
        this.gcpStorage = gcpStorage;
        this.rabbitMQ = rabbitMQ;
        this.ingestFileRepository = ingestFileRepository;
        this.logger = new common_1.Logger(IngestExcelService_1.name);
    }
    async orchestrateIngestion(file, user, companyId) {
        try {
            const fileId = await this.gcpStorage.upload(file);
            const message = {
                fileId,
                companyId: companyId,
                originalName: file.originalname,
                uuidUser: user.uuidUser,
                uuidTenant: user.plan === 'free' ? 'free' : user.uuidTenant,
                timestamp: new Date().toISOString(),
            };
            await this.rabbitMQ.publish('excel_queue', message);
            await this.ingestFileRepository.createMany({
                company_id: companyId,
                file_id: fileId,
                file_name: file.originalname,
                uploaded_by: user.uuidUser,
                status: 'PENDING',
                created_at: new Date(),
            });
            this.logger.log(`Ingesta orquestada para company: ${companyId}`);
            return {
                success: true,
                fileId,
                message: 'Archivo en cola de procesamiento',
            };
        }
        catch (error) {
            this.logger.error(`Error orquestando ingesta: ${error.message}`);
            throw error;
        }
    }
};
exports.IngestExcelService = IngestExcelService;
exports.IngestExcelService = IngestExcelService = IngestExcelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gcp_storage_service_1.GcpStorageService,
        rabbitmq_service_1.RabbitMQService,
        movementIngestFile_repository_1.MovementIngestFileRepository])
], IngestExcelService);
//# sourceMappingURL=ingest-excel.service.js.map