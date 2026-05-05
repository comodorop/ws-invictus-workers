import { Injectable } from '@nestjs/common';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { MovementIngestFileEntity } from './entities/movementIngestFile.entity';
// import { randomUUID } from 'crypto';

@Injectable()
export class MovementIngestFileRepository {
  constructor(private readonly tenantConn: TenantConnectionService) {}

  async createMany(data: MovementIngestFileEntity) {
    const db = await this.tenantConn.getConnection('free');

    const [ingestFile] = await db('movement_ingest_files')
      .insert(data)
      .returning('*');

    return ingestFile;
  }

  async update(
    criteria: Partial<MovementIngestFileEntity>,
    dataToUpdate: Partial<MovementIngestFileEntity>,
  ) {
    const db = await this.tenantConn.getConnection('free');
    const company = await db('movement_ingest_files')
      .where(criteria)
      .update(dataToUpdate)
      .returning('*');
    return company;
  }
}
