// src/mailer/consumers/email.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { MailerService } from '../mailer.service';

interface EmailPayload {
  to: string;
  subject: string;
  message: string;
  type: 'text' | 'html';
  fromName?: string;
  metadata?: any; // Para tracking interno
}

@Controller()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly mailerService: MailerService) {}

  @EventPattern('send_email_queue')
  async handleEmailJob(@Payload() data: EmailPayload, @Ctx() context: RmqContext) {
    console.log('Recibido email job:', data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Validaciones básicas de entrada
      if (!data.to || !data.subject || !data.message) {
        this.logger.warn('Mensaje de email mal formado, descartando...');
        return channel.ack(originalMsg);
      }

      console.log('Enviando email...');
      const r = await this.mailerService.send(
        data.to,
        data.subject,
        data.message,
        data.type || 'html',
        data.fromName
      );

      console.log('Email enviado:', r);

      // Confirmar procesamiento exitoso
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error en el worker de email: ${error.message}`);
      
      // Si el error es de autenticación o configuración, mejor no re-encolar (false)
      // Si es un timeout temporal, podrías poner true para reintentar
      channel.nack(originalMsg, false, false); 
    }
  }
}