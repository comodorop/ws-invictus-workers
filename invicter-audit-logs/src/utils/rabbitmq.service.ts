import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class RabbitMQService {
  private channel: amqp.Channel;

  async onModuleInit() {
    console.log(process.env.RABBITMQ_URL);
    const conn = await amqp.connect(process.env.RABBITMQ_URL ?? '');
    this.channel = await conn.createChannel();

    await this.channel.assertQueue('excel_queue', {
      durable: true,
    });
  }

  // async publish(queue: string, message: any) {
  //   if (!this.channel) return;

  //   await this.channel.assertQueue(queue, {
  //     durable: true,
  //   });

  //   this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
  //     persistent: true,
  //   });
  // }

  async publish(queue: string, message: any) {
    if (!this.channel) return;

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    // NestJS espera este "envelope" para poder rutar al @EventPattern
    const nestJsMessage = {
      pattern: queue, // El nombre de la cola debe coincidir con el @EventPattern('excel_queue')
      data: message,
    };

    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(nestJsMessage)),
      { persistent: true },
    );
  }
}
