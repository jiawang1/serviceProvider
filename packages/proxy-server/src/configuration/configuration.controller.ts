import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { ProjectService } from './file/project.service';
import { CACHE_STRATEGY } from './util';

@Controller()
export class ConfigurationController {
  constructor(private config: ProjectService) {}

  @Get('projects')
  async getProjectList() {
    return this.config.getProjectList();
  }

  @Post('projects')
  async createProject(@Body('projectName') projectName) {
    try {
      await this.config.createProject(projectName);
      return this.config.getProjectList();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.CONFLICT);
    }
  }
  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    try {
      return await this.config.getProject(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put('projects/:id')
  async saveProjectConfig(@Body() data) {
    try {
      await this.config.updateProject(data);
      return 'Success';
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('CacheStrategys')
  getStrategyList() {
    return Object.keys(CACHE_STRATEGY).map(k => {
      return { key: CACHE_STRATEGY[k], text: k };
    });
  }

  @Post()
  async createService() {}
}
