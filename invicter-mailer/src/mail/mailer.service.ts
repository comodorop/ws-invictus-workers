// src/mailer/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    // Forzamos el tipado a SMTPTransport.Options para habilitar las propiedades de pooling
    const options = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true, // Ahora TS lo aceptará al pasarlo por createTransport
      maxConnections: 5,
      maxMessages: 100,
    } as SMTPTransport.Options;

    this.transporter = nodemailer.createTransport(options);
  }

  async send(to: string, subject: string, content: string, type: 'text' | 'html', fromName?: string) {
    try {
      // Validamos que el destinatario exista antes de intentar enviar
      if (!to) throw new Error('Recipient email (to) is undefined');

      const info = await this.transporter.sendMail({
        from: `"${fromName || 'Sistema'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        [type]: content,
      });
      
      this.logger.log(`Email enviado: ${info.messageId} a ${to}`);
      return info;
    } catch (error) {
      this.logger.error(`Fallo al enviar a ${to}: ${error.message}`);
      throw error; 
    }
  }
}