"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementIngestFileMapper = void 0;
const common_1 = require("@nestjs/common");
let MovementIngestFileMapper = class MovementIngestFileMapper {
    toDto(entity) {
        return {
            id: entity.id,
            companyId: entity.company_id,
            fileId: entity.file_id,
            fileName: entity.file_name,
            uploadedBy: entity.uploaded_by,
            status: entity.status,
            totalRecords: entity.total_records || 0,
            successRecords: entity.success_records || 0,
            errorRecords: entity.error_records || 0,
            createdAt: entity.created_at,
            startedAt: entity.started_at,
            completedAt: entity.completed_at,
        };
    }
    toEntity(dto) {
        return {
            id: dto.id,
            company_id: dto.companyId,
            file_id: dto.fileId,
            file_name: dto.fileName,
            uploaded_by: dto.uploadedBy,
            status: dto.status,
            total_records: dto.totalRecords,
            success_records: dto.successRecords,
            error_records: dto.errorRecords,
            created_at: dto.createdAt,
            started_at: dto.startedAt,
            completed_at: dto.completedAt,
        };
    }
};
exports.MovementIngestFileMapper = MovementIngestFileMapper;
exports.MovementIngestFileMapper = MovementIngestFileMapper = __decorate([
    (0, common_1.Injectable)()
], MovementIngestFileMapper);
//# sourceMappingURL=movementIngestFile.mapper.js.map