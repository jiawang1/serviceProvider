import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Injectable } from '@nestjs/common';
import { Configuration } from '../configuration.interface';
import { isJSON, separatter, isObject, isString } from '../util';

@Injectable()
export class FileService {
  private rootPath = `${os.homedir()}/.service-provider`;

  private makesureProjectFolder = async () => {
    const projectStat = await fs.lstat(this.rootPath);
    if (!projectStat.isDirectory) {
      await fs.mkdir(this.rootPath);
    }
  };

  private sortObject = obj => {
    return Object.keys(obj)
      .sort()
      .reduce((pre, k) => {
        return `${pre}${pre.length === 0 ? '' : ','}${k}=${obj[k]}`;
      }, '');
  };

  // private constructServiceId = (serviceConfig = {}) => {
  //   const { url, param, method, body } = serviceConfig;
  //   let _body = '';
  //   if (isJSON(body)) {
  //     _body = this.sortObject(isString(body) ? JSON.parse(body) : body);
  //   } else if (isString(body)) {
  //     _body = body;
  //   }
  //   return _body.length > 0
  //     ? [method, url, param, _body].join(separatter.toString())
  //     : [method, url, param].join(separatter.toString());
  // };

  private constructServiceId = (serviceConfig = {}) => {
    const { url, method } = serviceConfig;
    return `${method}${separatter.toString()}${url}`;
  };

  public async createProject(projectName: string) {
    await this.makesureProjectFolder();
    const projectFilePath = path.join(this.rootPath, projectName);
    const projectStat = await fs.lstat(projectFilePath);
    if (!projectStat.isDirectory()) {
      await fs.mkdir(projectFilePath);
    }
  }

  public updateBasicConfig = async (projectName, config = {}) => {
    const projectFilePath = path.join(this.rootPath, projectName);
    await fs.writeFile(projectFilePath, JSON.stringify(config), 'utf8');
  };

  public updateService = async (projectName, serviceConfig) => {
    const seviceId = this.constructServiceId(serviceConfig);
    const { header, response, url, param, method, body } = serviceConfig;
    const servicePath = path.join(this.rootPath, projectName, seviceId);

    try {
      if (!response) {
      }
    } catch (e) {}
  };

  public loadServiceList = async () => {};
}
