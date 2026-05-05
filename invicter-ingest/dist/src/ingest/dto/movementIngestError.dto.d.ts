export declare class CreateMovementIngestErrorDto {
    companyId: string;
    rawPayload: any;
    errorType?: any;
    dbErrorMessage?: string;
    status?: string;
    fileName?: string;
}
export declare class MovementIngestErrorDto {
    id: string;
    companyId: string;
    rawPayload: any;
    errorType?: any;
    dbErrorMessage?: string;
    status: 'PENDING' | 'RESOLVED' | 'IGNORED';
    fileName?: string;
    createdAt: Date;
}
export declare class MovementIngestErrorFilterDto {
    companyId?: string;
    status?: string;
    page?: number;
    limit?: number;
}
