import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationController } from './configuration/configuration.controller';

@Module({
  imports: [],
  controllers: [AppController, ConfigurationController],
  providers: [AppService],
})
export class AppModule {}
