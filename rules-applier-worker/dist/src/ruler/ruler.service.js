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
var RulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulerService = void 0;
const common_1 = require("@nestjs/common");
const rules_1 = require("./rules/rules");
const issues_contant_1 = require("./contants/issues.contant");
const movement_issues_repository_1 = require("../repositories/movement-issues.repository");
let RulerService = RulerService_1 = class RulerService {
    constructor(movementIssuesRepository) {
        this.movementIssuesRepository = movementIssuesRepository;
        this.logger = new common_1.Logger(RulerService_1.name);
    }
    async applyRules(movements) {
        this.logger.log('Applying rules to movement:', movements);
        const issues = [];
        for (const movement of movements) {
            if (rules_1.Rules.isOutOfPeriod(movement.date, movement.created_at)) {
                issues.push({
                    movement_id: movement.id,
                    reason: issues_contant_1.ISSUE_CODES.OUT_OF_PERIOD.reason,
                    message: issues_contant_1.ISSUE_CODES.OUT_OF_PERIOD.message,
                    severity: issues_contant_1.ISSUE_CODES.OUT_OF_PERIOD.severity,
                });
            }
        }
        if (issues.length > 0) {
            await this.movementIssuesRepository.createMany(issues);
        }
        else {
            this.logger.log('No issues found for movement:', movements);
        }
    }
};
exports.RulerService = RulerService;
exports.RulerService = RulerService = RulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [movement_issues_repository_1.MovementIssuesRepository])
], RulerService);
//# sourceMappingURL=ruler.service.js.map