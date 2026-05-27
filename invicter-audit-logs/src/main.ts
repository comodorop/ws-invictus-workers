import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  // 🔹 Habilitar CORS solo para localhost:7000
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 1. Conectar el microservicio de RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'log_audit',
      noAck: false, // Obligatorio si usas channel.ack() manualmente
      queueOptions: {
        durable: true,
      },
    },
  });

  // 2. ¡CRÍTICO! Iniciar todos los microservicios conectados
  await app.startAllMicroservices();

  // 🔹 Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // await app.listen(7000);
  await app.init();
  console.log('Ingest service is running and connected to RabbitMQ!');
}

bootstrap();
