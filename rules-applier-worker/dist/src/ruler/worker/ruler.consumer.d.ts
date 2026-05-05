import { RmqContext } from '@nestjs/microservices';
import { RulerService } from '../ruler.service';
export interface MovementEntity {
    id: string;
    company_id: string;
    amount: number;
    date: string;
    is_fiscal: boolean;
    description: string;
    account_type: string;
    currency: string;
    category_type: string;
    accounting_code: string;
    metadata: any;
    created_at: Date;
}
export declare class RulerConsumer {
    private readonly rulerService;
    private readonly logger;
    constructor(rulerService: RulerService);
    handleRulerJob(data: MovementEntity[], context: RmqContext): Promise<void>;
}
