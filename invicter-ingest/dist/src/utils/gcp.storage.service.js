"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcpStorageService = void 0;
const storage_1 = require("@google-cloud/storage");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
let GcpStorageService = class GcpStorageService {
    constructor() {
        this.storage = new storage_1.Storage({
            projectId: process.env.GCP_PROJECT_ID,
            credentials: {
                client_email: process.env.GCP_CLIENT_EMAIL,
                private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
        });
    }
    async upload(file) {
        const bucket = this.storage.bucket(process.env.GCP_BUCKET || '');
        const fileId = `uploads/${(0, crypto_1.randomUUID)()}.xlsx`;
        const blob = bucket.file(fileId);
        await blob.save(file.buffer, {
            contentType: file.mimetype,
        });
        return fileId;
    }
    async download(fileId) {
        try {
            const bucket = this.storage.bucket(process.env.GCP_BUCKET || '');
            const file = bucket.file(fileId);
            const [exists] = await file.exists();
            if (!exists) {
                throw new Error(`El archivo ${fileId} no existe en GCP Storage`);
            }
            const [content] = await file.download();
            return content;
        }
        catch (error) {
            console.log(`Error descargando archivo de GCP: ${error.message}`);
            throw error;
        }
    }
};
exports.GcpStorageService = GcpStorageService;
exports.GcpStorageService = GcpStorageService = __decorate([
    (0, common_1.Injectable)()
], GcpStorageService);
//# sourceMappingURL=gcp.storage.service.js.map