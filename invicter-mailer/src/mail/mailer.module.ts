import { Module } from '@nestjs/common';
import { RabbitMQService } from '../utils/rabbitmq.service';
import { EmailConsumer } from './worker/mailer.consumer';

import { MailerService } from './mailer.service';

@Module({
  controllers: [EmailConsumer],
  providers: [
    RabbitMQService,
    MailerService,
  ],
})
export class MailModule {}
