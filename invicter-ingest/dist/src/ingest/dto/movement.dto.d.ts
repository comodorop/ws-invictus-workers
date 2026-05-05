export declare class RequestCreateMovementDto {
    movements: CreateMovementDto[];
}
export declare class CreateMovementDto {
    companyId?: string;
    amount: number;
    date: string;
    isFiscal?: boolean | string;
    description?: string;
    accountType: string;
    currency: string;
    categoryType: string;
    accountingCode: string;
    metadata: {
        userId: string;
        sourceType: 'EXCEL' | 'API' | 'FORM';
        fileName?: string;
        transactionId?: string;
        reason?: string;
    };
}
export declare class MovementDto extends CreateMovementDto {
    id: string;
}
export declare class MovementFilterDto {
    startDate?: string;
    endDate?: string;
    accountType?: string;
    categoryType?: string;
    isFiscal?: boolean | string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}
export declare class StatsFilterDto {
    startDate?: string;
    endDate?: string;
}
