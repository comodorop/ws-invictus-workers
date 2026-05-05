// src/mailer/consumers/email.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
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

@Controller()
export class RulerConsumer {
  private readonly logger = new Logger(RulerConsumer.name);

  constructor(private readonly rulerService: RulerService) { }

  @EventPattern('permisive_rules')
  async handleRulerJob(@Payload() data: MovementEntity[], @Ctx() context: RmqContext) {
    console.log('Recibido ruler job:', data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('Enviando email...');
      const r = await this.rulerService.applyRules(data);

      console.log('Email enviado:', r);

      // Confirmar procesamiento exitoso
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error en el worker de rules-applier-worker: ${error.message}`);

      // Si el error es de autenticación o configuración, mejor no re-encolar (false)
      // Si es un timeout temporal, podrías poner true para reintentar
      channel.nack(originalMsg, false, false);
    }
  }
}