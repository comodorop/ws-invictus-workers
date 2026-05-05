import { RmqContext } from '@nestjs/microservices';
import { MailerService } from '../mailer.service';
interface EmailPayload {
    to: string;
    subject: string;
    message: string;
    type: 'text' | 'html';
    fromName?: string;
    metadata?: any;
}
export declare class EmailConsumer {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    handleEmailJob(data: EmailPayload, context: RmqContext): Promise<any>;
}
export {};
