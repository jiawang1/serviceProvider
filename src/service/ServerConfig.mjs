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
        key.split('.').forEach((K, inx, arr) => {
          if (inx === arr.length - 1) {
            obj[K] = template[key];
          } else {
            obj = obj[K] ? obj[K] : (obj[K] = {});
          }
        });
      } else {
        obj[key] = template[key];
      }
      return obj;
    }, {});
    /* eslint-enable no-param-reassign */
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

  save() {
    return new Promise((resolve, reject) => {
      if (this.isChanged) {
        fs.writeFile(constants.SERVER_CONFIG, JSON.stringify(this.serverMap), err => {
          if (err) {
            reject(err);
          } else {
            resolve('success');
            this.isChanged = false;
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

  __retrieveSymbol(key) {
    return this.__symbolMap.get(key) || this.__symbolMap.set(key, Symbol(key)).get(key);
  }
  // calConfig() {
  //   return this;
  // }

  getServerLoader() {
    return this.get('toDatabase') === 'true' ? dbLoader : fileLoader;
  }

  __initDB(name) {
    console.log(name);
    // dbLoader.initDB(name);
  }

  constructor() {
    this.isChanged = false;
    const defaultMap = ServerConfig.getDefault();
    this.serverMap = {};
    Object.assign(this.serverMap, defaultMap);

    if (this.serverMap.toDatabase) {
      this.__initDB(this.serverMap.databaseName);
    }
  }
}

const oConfig = new ServerConfig();
const getServerConfig = () => oConfig;

export default getServerConfig;
