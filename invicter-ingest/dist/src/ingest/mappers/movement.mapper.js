"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementMapper = void 0;
const common_1 = require("@nestjs/common");
let MovementMapper = class MovementMapper {
    dtoToEntity(dto, sourceType, userId) {
        return {
            amount: dto.amount,
            date: dto.date,
            is_fiscal: typeof dto.isFiscal === 'string'
                ? dto.isFiscal.trim().toUpperCase() === 'SI'
                : (dto.isFiscal ?? true),
            description: dto.description || '',
            account_type: dto.accountType,
            currency: dto.currency,
            category_type: dto.categoryType,
            company_id: dto.companyId || '',
            accounting_code: dto.accountingCode,
            metadata: { ...dto.metadata, sourceType, userId },
        };
    }
    entityToDto(entity) {
        return {
            id: entity.id,
            amount: Number(entity.amount),
            date: entity.date,
            isFiscal: entity.is_fiscal,
            description: entity.description,
            accountType: entity.account_type,
            currency: entity.currency,
            categoryType: entity.category_type,
            companyId: entity.company_id,
            accountingCode: entity.accounting_code,
            metadata: typeof entity.metadata === 'string'
                ? JSON.parse(entity.metadata)
                : entity.metadata,
        };
    }
};
exports.MovementMapper = MovementMapper;
exports.MovementMapper = MovementMapper = __decorate([
    (0, common_1.Injectable)()
], MovementMapper);
//# sourceMappingURL=movement.mapper.js.map