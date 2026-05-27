export declare class CreateTenantDto {
    name: string;
    subdomain?: string;
    plan?: 'free' | 'pro';
    db_host?: string;
    db_port?: number;
    db_name?: string;
    db_user?: string;
    db_password?: string;
    db_schema?: string;
}
