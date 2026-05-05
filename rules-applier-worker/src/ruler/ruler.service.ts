// src/mailer/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MovementEntity } from './worker/ruler.consumer';
import { Rules } from './rules/rules';
import { ISSUE_CODES, IssueCode } from './contants/issues.contant';
import { Severity } from './contants/severities.constant';
import { MovementIssuesRepository } from '../repositories/movement-issues.repository';

export interface IssueEntity {
  id?: string;
  movement_id: string;
  reason: IssueCode
  message: string;
  severity: Severity;
}

@Injectable()
export class RulerService {
  private readonly logger = new Logger(RulerService.name);

  constructor(private readonly movementIssuesRepository: MovementIssuesRepository) {
  }

  async applyRules(movements: MovementEntity[]): Promise<void> {
    this.logger.log('Applying rules to movement:', movements);
    const issues: IssueEntity[] = [];

    for (const movement of movements) {
      if (Rules.isOutOfPeriod(movement.date, movement.created_at)) {
        // Debe ir guardando los issues aqui y en otras validaciones para al final insertar en movement_issues
        // Debe ir guardando los issues aqui y en otras validaciones para al final insertar en movement_issues
        issues.push({
          movement_id: movement.id,
          reason: ISSUE_CODES.OUT_OF_PERIOD.reason,
          message: ISSUE_CODES.OUT_OF_PERIOD.message,
          severity: ISSUE_CODES.OUT_OF_PERIOD.severity,
        });
      }
    }

    // Guardar los issues en movement_issues
    if (issues.length > 0) {
      await this.movementIssuesRepository.createMany(issues);
    } else {
      this.logger.log('No issues found for movement:', movements);
    }
  }
}
