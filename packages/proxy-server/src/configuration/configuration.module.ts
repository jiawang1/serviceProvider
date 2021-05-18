import { Module } from '@nestjs/common';
import { ProjectService } from './file/project.service';
import { Service } from './file/service.service';
import { ConfigurationController } from './configuration.controller';

@Module({
  imports: [],
  controllers: [ConfigurationController],
  providers: [ProjectService, Service],
  exports: [ProjectService, Service],
})
export class ConfigurationModule {}
