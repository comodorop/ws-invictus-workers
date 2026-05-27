// src/audit/audit.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AuditRepository } from './audit.repository';
import { AuditLogEntry } from './audit.types';

@Controller()
export class AuditConsumer {
  private readonly logger = new Logger(AuditConsumer.name);

  constructor(private readonly auditRepo: AuditRepository) {}

  @EventPattern('log_audit')
  async handleAuditLog(@Payload() payload: { pattern: string, data: AuditLogEntry }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Usamos el repositorio especializado
      await this.auditRepo.create(payload.data);

      this.logger.log(`Audit log guardado: ${payload.data.action} sobre ${payload.data.resource_type}`);
      
      // Confirmamos a RabbitMQ
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error al insertar log de auditoría: ${error.message}`);
      
      // Nack sin re-encolar para evitar loops infinitos si los datos están mal formados
      channel.nack(originalMsg, false, false);
    }
  }
}