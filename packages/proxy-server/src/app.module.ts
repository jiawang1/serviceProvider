import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationController } from './configuration/configuration.controller';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [ConfigurationModule],
  controllers: [AppController, ConfigurationController],
  providers: [AppService],
})
export class AppModule {}
