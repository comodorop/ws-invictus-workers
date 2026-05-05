"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let JWTService = class JWTService {
    constructor() {
        this.jwtService = new jwt_1.JwtService({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        });
    }
    async generateToken(user) {
        const payload = {
            uuidUser: user.uuidUser,
            email: user.email,
            plan: user.plan,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            return {
                success: true,
                data: payload,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.JWTService = JWTService;
exports.JWTService = JWTService = __decorate([
    (0, common_1.Injectable)()
], JWTService);
//# sourceMappingURL=jwt.services.js.map