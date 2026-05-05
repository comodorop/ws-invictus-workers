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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementIngestErrorFilterDto = exports.MovementIngestErrorDto = exports.CreateMovementIngestErrorDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_2 = require("class-validator");
class CreateMovementIngestErrorDto {
}
exports.CreateMovementIngestErrorDto = CreateMovementIngestErrorDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMovementIngestErrorDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMovementIngestErrorDto.prototype, "rawPayload", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMovementIngestErrorDto.prototype, "errorType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementIngestErrorDto.prototype, "dbErrorMessage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['PENDING', 'RESOLVED', 'IGNORED']),
    __metadata("design:type", String)
], CreateMovementIngestErrorDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementIngestErrorDto.prototype, "fileName", void 0);
class MovementIngestErrorDto {
}
exports.MovementIngestErrorDto = MovementIngestErrorDto;
class MovementIngestErrorFilterDto {
}
exports.MovementIngestErrorFilterDto = MovementIngestErrorFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MovementIngestErrorFilterDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['PENDING', 'RESOLVED', 'IGNORED']),
    __metadata("design:type", String)
], MovementIngestErrorFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], MovementIngestErrorFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], MovementIngestErrorFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=movementIngestError.dto.js.map