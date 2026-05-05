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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ingest_excel_service_1 = require("./ingest-excel.service");
const ingest_service_1 = require("./ingest.service");
const movement_dto_1 = require("./dto/movement.dto");
let IngestController = class IngestController {
    constructor(ingestExcelService, ingestService) {
        this.ingestExcelService = ingestExcelService;
        this.ingestService = ingestService;
    }
    async upload(id, file, req) {
        try {
            if (!file) {
                throw new Error('Archivo Excel no encontrado en la petición');
            }
            const user = req.user;
            return await this.ingestExcelService.orchestrateIngestion(file, user, id);
        }
        catch (error) {
            throw new common_1.HttpException({ success: false, message: error.message }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async fromApi(id, data, req) {
        const user = req.user;
        return await this.ingestService.createDirectEntry(data, 'API', user.uuidUser, id);
    }
    async fromForm(id, data, req) {
        return await this.ingestService.createDirectEntry(data, 'FORM', req.user, id);
    }
    async getMovements(id, filters) {
        return await this.ingestService.getMovements(filters, id);
    }
    async deleteMovement(uuid) {
        return await this.ingestService.removeEntry(uuid);
    }
    async getStats(id, filters) {
        return await this.ingestService.getDashboard(filters, id);
    }
};
exports.IngestController = IngestController;
__decorate([
    (0, common_1.Post)('/excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "fromApi", null);
__decorate([
    (0, common_1.Post)('/form'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "fromForm", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, movement_dto_1.MovementFilterDto]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Delete)('/:uuid'),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "deleteMovement", null);
__decorate([
    (0, common_1.Get)('/stats'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, movement_dto_1.StatsFilterDto]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "getStats", null);
exports.IngestController = IngestController = __decorate([
    (0, common_1.Controller)('company/:id/movement'),
    __metadata("design:paramtypes", [ingest_excel_service_1.IngestExcelService,
        ingest_service_1.IngestService])
], IngestController);
//# sourceMappingURL=ingest.controller.js.map