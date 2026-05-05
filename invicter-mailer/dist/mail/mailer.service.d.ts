export declare class MailerService {
    private transporter;
    private readonly logger;
    constructor();
    send(to: string, subject: string, content: string, type: 'text' | 'html', fromName?: string): Promise<any>;
}
