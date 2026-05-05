import { MovementEntity } from './worker/ruler.consumer';
import { IssueCode } from './contants/issues.contant';
import { Severity } from './contants/severities.constant';
import { MovementIssuesRepository } from '../repositories/movement-issues.repository';
export interface IssueEntity {
    id?: string;
    movement_id: string;
    reason: IssueCode;
    message: string;
    severity: Severity;
}
export declare class RulerService {
    private readonly movementIssuesRepository;
    private readonly logger;
    constructor(movementIssuesRepository: MovementIssuesRepository);
    applyRules(movements: MovementEntity[]): Promise<void>;
}
