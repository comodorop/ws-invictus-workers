import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RulerModule } from './ruler/ruler.module';

@Module({
  imports: [
    // ConfigModule lee el archivo .env y expone ConfigService globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    RulerModule,
  ]
})
export class AppModule {
}
