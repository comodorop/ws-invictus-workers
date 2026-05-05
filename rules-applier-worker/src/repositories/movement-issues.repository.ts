import { Injectable } from '@nestjs/common';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { MovementEntity } from 'src/ruler/worker/ruler.consumer';
import { IssueEntity } from 'src/ruler/ruler.service';
// import { randomUUID } from 'crypto';

@Injectable()
export class MovementIssuesRepository {
  constructor(private readonly tenantConn: TenantConnectionService) {}

  async createMany(entities: IssueEntity[]) {
    const db = await this.tenantConn.getConnection('free');
    const BATCH_SIZE = 500;
    const results: { insertedIds: string[]; errorCount: number } = {
      insertedIds: [],
      errorCount: 0,
    };

    // Procesamos por lotes
    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const chunk = entities.slice(i, i + BATCH_SIZE);

      try {
        // Intento de inserción masiva por lote
        const saved = await db('movement_issues')
          .insert(chunk)
          .onConflict([
            'movement_id',
            'reason'
          ])
          .merge()
          .returning('id');

        results.insertedIds.push(...saved.map((r: IssueEntity) => r.id!));
      } catch (error) {
        console.log(
          `Lote fallido (índice ${i}). Intentando inserción individual para rescatar registros.`,
        );

        // FALLBACK: Si el lote falla, procesamos uno por uno
        for (const entity of chunk) {
          try {
            const [saved] = await db('movement_issues')
              .insert(entity)
              .onConflict([
                'movement_id',
                'reason'
              ])
              .merge()
              .returning('id');

            results.insertedIds.push(saved.id);
          } catch (individualError) {
            console.error(individualError.message, individualError);
          }
        }
      }
    }

    return results;
  }
}
