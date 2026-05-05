export declare class CreateMovementIngestFileDto {
    companyId: string;
    fileId: string;
    fileName: string;
    uploadedBy?: string;
    status?: string;
}
export declare class MovementIngestFileDto {
    id?: string;
    companyId: string;
    fileId: string;
    fileName: string;
    uploadedBy?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
    totalRecords: number;
    successRecords: number;
    errorRecords: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class MovementIngestFileFilterDto {
    companyId?: string;
    status?: string;
    fileName?: string;
    page?: number;
    limit?: number;
}
