// const PouchDB = require("pouchdb"),

import fs from 'fs';
import fileLoader from './FileLoader';
import dbLoader from './DBLoader';
import constants from '../utils/constants';

const template = {
  port: 8079,
  cacheStrategy: constants.cacheStrategy.remoteFirst,
  workingMode: constants.workingMode.serviceProvider,
  sync: true, // if sync = true , it will update cache automatically after response back from remote server
  toDatabase: false,
  databaseName: '',
  'endpointServer.address': 'https://localhost',
  'endpointServer.port': 9002,
  'endpointServer.host': undefined,
  'endpointServer.user': undefined,
  'endpointServer.password': undefined,
  cacheFile: 'proxyCache.json',
  resourceRoute: '/_ui/(.*)', // "/webapp/(.*)"
  SSLKey: '',
  SSLCert: '',
  rootPath: '',
  'proxy.host': undefined,
  'proxy.port': undefined
};

class ServerConfig {
  static getDefault() {
    /* eslint-disable no-param-reassign */
    const __defaultConfig = Object.keys(template).reduce((obj, key) => {
      if (key.indexOf('.') >= 0) {
        let temp = obj;
        key.split('.').forEach((K, inx, arr) => {
          if (inx === arr.length - 1) {
            temp[K] = template[key];
          } else {
            temp = temp[K] ? temp[K] : (temp[K] = {});
          }
        });
      } else {
        obj[key] = template[key];
      }
      return obj;
    }, {});
    /* eslint-enable no-param-reassign */
    debugger;
    __defaultConfig.keys = () => Object.keys(template);
    ServerConfig.getDefault = () => __defaultConfig;
    return __defaultConfig;
  }

  get fields() {
    return Object.keys(template);
  }

  set(k, val) {
    if (this.fields.indexOf(k) >= 0) {
      let _o = this.serverMap;
      k.split('.').some((key, inx, arr) => {
        if (inx === arr.length - 1) {
          if (_o[key] !== val) {
            this.isChanged = true;
            _o[key] = val;
          }
          return true;
        }
        _o = _o[key];
        return false;
      });
    }
    return this;
  }

  check(k, val) {
    if (this.fields.indexOf(k) >= 0) {
      let _o = this.serverMap;
      return k.split('.').some((key, inx, arr) => {
        if (inx === arr.length - 1) {
          if (_o[key] !== val) {
            _o[key] = val;
            return true;
          }
          return false;
        }
        _o = _o[key];
        return false;
      });
    }
    return false;
  }

  save(aConfig) {
    const isDiff = aConfig.reduce((tag, config) => tag || this.check(config.key, config.val), false);
    return new Promise((resolve, reject) => {
      if (isDiff) {
        fs.writeFile(constants.SERVER_CONFIG, JSON.stringify(this.serverMap), err => {
          if (err) {
            reject(err);
          } else {
            resolve('success');
          }
        });
      } else {
        resolve('no change');
      }
    });
  }

  get(key) {
    // if (key === "endpointServer.host") {
    // 	let matched = this.get("endpointServer.address").match(/^http(?:s)?:\/\/([^\/]+)/);
    // 	return matched?matched[1]:'';
    // }
    let _o = this.serverMap;
    key.split('.').forEach(k => {
      _o = _o[k];
    });
    return _o;
  }

  hasProxy() {
    return !!(this.get('proxy') && this.get('proxy').host && this.get('proxy').host.length > 0);
  }

  isSSL() {
    return this.get('endpointServer.address').indexOf('https') >= 0;
  }

  loadConfigFile() {
    try {
      fs.statSync(constants.SERVER_CONFIG);
      const config = fs.readFileSync(constants.SERVER_CONFIG, 'utf-8');
      return config.length > 0 ? JSON.parse(config) : {};
    } catch (e) {
      try {
        fs.statSync('./_config');
      } catch (err) {
        fs.mkdirSync('./_config');
      }
      fs.writeFileSync(constants.SERVER_CONFIG, '');
      return {};
    }
  }

  getServerLoader() {
    return this.get('toDatabase') === 'true' ? dbLoader : fileLoader;
  }

  __initDB(name) {
    console.log(name);
    // dbLoader.initDB(name);
  }

  constructor() {
    this.isChanged = false;
    debugger;
    const defaultMap = ServerConfig.getDefault();
    this.serverMap = {};
    Object.assign(this.serverMap, defaultMap, this.loadConfigFile());

    if (this.serverMap.toDatabase) {
      this.__initDB(this.serverMap.databaseName);
    }
  }
}

const oConfig = new ServerConfig();
const getServerConfig = () => oConfig;

export default getServerConfig;
