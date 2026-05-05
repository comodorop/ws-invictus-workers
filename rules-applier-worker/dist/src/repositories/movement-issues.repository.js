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
exports.MovementIssuesRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../database/tenant-connection.service");
let MovementIssuesRepository = class MovementIssuesRepository {
    constructor(tenantConn) {
        this.tenantConn = tenantConn;
    }
    async createMany(entities) {
        const db = await this.tenantConn.getConnection('free');
        const BATCH_SIZE = 500;
        const results = {
            insertedIds: [],
            errorCount: 0,
        };
        for (let i = 0; i < entities.length; i += BATCH_SIZE) {
            const chunk = entities.slice(i, i + BATCH_SIZE);
            try {
                const saved = await db('movement_issues')
                    .insert(chunk)
                    .onConflict([
                    'movement_id',
                    'reason'
                ])
                    .merge()
                    .returning('id');
                results.insertedIds.push(...saved.map((r) => r.id));
            }
            catch (error) {
                console.log(`Lote fallido (índice ${i}). Intentando inserción individual para rescatar registros.`);
                for (const entity of chunk) {
                    try {
                        const [saved] = await db('movement_issues')
                            .insert(entity)
                            .onConflict([
                            'movement_id',
                            'reason'
                        ])
                            .merge()
                            .returning('id');
                        results.insertedIds.push(saved.id);
                    }
                    catch (individualError) {
                        console.error(individualError.message, individualError);
                    }
                }
            }
        }
        return results;
    }
};
exports.MovementIssuesRepository = MovementIssuesRepository;
exports.MovementIssuesRepository = MovementIssuesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], MovementIssuesRepository);
//# sourceMappingURL=movement-issues.repository.js.map