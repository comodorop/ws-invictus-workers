import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mailer.module';

@Module({
  imports: [
    // ConfigModule lee el archivo .env y expone ConfigService globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
  ]
})
export class AppModule {
}
