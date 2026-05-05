export declare class MovementIngestErrorEntity {
    id?: string;
    company_id: string;
    raw_payload: any;
    error_type?: any;
    db_error_message?: string;
    status?: 'PENDING' | 'RESOLVED' | 'IGNORED';
    file_name?: string;
    created_at?: Date;
}
