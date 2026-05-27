export interface AuditLogEntry {
    user_id: string;
    user_email: string;
    action: string;
    resource_type: string;
    resource_id?: number;
    new_values?: Record<string, any>;
    created_at: Date;
}
