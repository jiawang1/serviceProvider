import * as os from 'os';
import * as path from 'path';
import fs, { promises as fsPromise } from 'fs';
import { Injectable } from '@nestjs/common';
import { Configuration } from '../configuration.interface';
import { isJSON, separatter, isObject, isString } from '../util';

import { ProjectConfiguration } from '../type';

export interface ServiceConfig {
  url: string;
  param: any;
  method: string;
  body: any;
}

const projectFolder = '.service-provider';
const projectConfigFile = '.config.json';

@Injectable()
export class ProjectService {
  private rootPath = `${os.homedir()}/${projectFolder}`;

  private makesureProjectFolder = async () => {
    try {
      await fsPromise.access(this.rootPath);
    } catch (e) {
      await fsPromise.mkdir(this.rootPath);
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

  private constructServiceId: (
    serviceConfig: ServiceConfig,
  ) => string = serviceConfig => {
    const { url, method } = serviceConfig;
    return `${method}${separatter.toString()}${url}`;
  };

  private generateProjectID = (name: string) => {
    return Buffer.from(name).toString('base64');
  };

  private id2Name = (id: string) => {
    return Buffer.from(id, 'base64').toString();
  };

  private generateProjectPath = id => {
    return path.join(this.rootPath, id);
  };

  public async createProject(projectName: string) {
    await this.makesureProjectFolder();
    const projectID = this.generateProjectID(projectName);
    const projectFilePath = this.generateProjectPath(projectID);
    const configFile = path.join(projectFilePath, projectConfigFile);

    try {
      await fsPromise.access(projectFilePath);
      throw new Error(`project ${projectName} already exist`);
    } catch (e) {
      await fsPromise.mkdir(projectFilePath);
      await fsPromise.writeFile(configFile, '{}', 'utf8');
      return projectID;
    }
  }

  public updateBasicConfig = async (projectName, config = {}) => {
    const projectFilePath = path.join(this.rootPath, projectName);
    await fsPromise.writeFile(projectFilePath, JSON.stringify(config), 'utf8');
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

  public getProjectList = async () => {
    await this.makesureProjectFolder();
    const files = await fsPromise.readdir(this.rootPath);

    const results = await Promise.all(
      files.map(_file => {
        return fsPromise.lstat(path.join(this.rootPath, _file));
      }),
    );

    return Promise.all(
      results
        .filter(result => result.isDirectory())
        .map((result, inx) => {
          const filePath = this.getFilePath(files[inx]);
          console.log(filePath);

          return fsPromise.readFile(filePath).then(buf => {
            const json = JSON.parse(buf.toString());
            json.projectId = files[inx];
            json.projectName = this.id2Name(files[inx]);
            return json;
          });
        }),
    );
  };

  private getFilePath = (id: string) => {
    const projectPath = this.generateProjectPath(id);
    return path.join(projectPath, projectConfigFile);
  };

  public getProject = async id => {
    const projectPath = this.generateProjectPath(id);
    const configFile = path.join(projectPath, projectConfigFile);
    const projectName = this.id2Name(id);

    try {
      await fsPromise.access(projectPath);
      const data = await fsPromise.readFile(configFile);

      if (data && data.length > 0) {
        const _config = JSON.parse(data.toString());
        _config.projectId = id;
        _config.projectName = projectName;
        return _config;
      }
      throw new Error(
        `Failed to load configuration file for project ${projectName}`,
      );
    } catch (e) {
      throw new Error(`project ${projectName} not exist`);
    }
  };

  public updateProject = async (config: ProjectConfiguration) => {
    const { projectId } = config;
    const filePath = this.getFilePath(projectId);

    try {
      await fsPromise.writeFile(filePath, JSON.stringify(config), 'utf8');
      return;
    } catch (e) {
      console.error(e);
      throw new Error(`failed to update project ${this.id2Name(projectId)}`);
    }
  };
}
