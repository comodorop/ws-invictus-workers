import { Module } from '@nestjs/common';
import { RabbitMQService } from '../utils/rabbitmq.service';
import { RulerConsumer } from './worker/ruler.consumer';

import { RulerService } from './ruler.service';
import { MovementIssuesRepository } from 'src/repositories/movement-issues.repository';
import { TenantConnectionService } from 'src/database/tenant-connection.service';

@Module({
  controllers: [RulerConsumer],
  providers: [
    RabbitMQService,
    RulerService,
    MovementIssuesRepository,
    TenantConnectionService,
  ],
})
export class RulerModule {}
