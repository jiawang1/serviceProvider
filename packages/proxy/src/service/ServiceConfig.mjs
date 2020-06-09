import path from 'path';
import fs from 'fs';
import constants from '../utils/constants.mjs';
import CacheStream from '../utils/CacheBranchStream.mjs';
import utils from '../utils/utils.mjs';

class ServiceConfig {
  constructor(config) {
    this.loader = config.getServerLoader();
    this.serviceMap = config.getServerLoader().loadServiceMap();
    this.serviceRoot = path.join(process.cwd(), './_config');
  }

  getServiceList() {
    return this.serviceMap;
  }

  __saveServiceList(oService) {
    return new Promise((resolve, reject) => {
      fs.writeFile(constants.SERVICE_CONFIG, JSON.stringify(this.serviceMap), err => {
        if (err) {
          reject(err);
        } else {
          resolve(oService);
        }
      });
    });
  }

  __shouldHandleZip(headers) {
    return Object.keys(headers).some(k => k.trim().includes('content-encoding') && headers[k].search(/gzip|deflate/) >= 0);
  }

  generateCacheStream(req, hostRes) {
    const oService = this.__generateConfigFromRequest(req, hostRes);
    const cacheFromStream = data => {
      oService.data = data;
      return Promise.all([this.addServiceURL(oService), this.addService(oService)]);
    };

    const shouldHandleZip = this.__shouldHandleZip(hostRes.headers);

    return shouldHandleZip ? new CacheStream(cacheFromStream, shouldHandleZip, hostRes.headers['content-encoding']) : new CacheStream(cacheFromStream);
  }

  __generateConfigFromRequest(req, res) {
    const oService = {};
    oService.method = req.method.toLowerCase();
    oService.headers = (res && res.headers) || req.headers;

    /*
     *  supprot request in EF, for get method, just consider url part after ? as param,
     *  for post , the param should be  url part after ? + bodydata in request
     * */

    const aUrl = req.url.split('?');
    [oService.url] = aUrl;

    if (oService.method === constants.method.httpGet) {
      oService.param = aUrl.length > 1 ? decodeURIComponent(aUrl[1]) : undefined;
    } else if (aUrl.length > 1) {
      oService.param = decodeURIComponent(`${aUrl[1]}_${req.bodyData}`);
    } else if (req.bodyData) {
      oService.param = decodeURIComponent(req.bodyData);
    } else {
      oService.param = undefined;
    }

    oService.path = this.generatePath({
      method: oService.method,
      fileName: req.url.replace(/^(.*)\?.*/, '$1').replace(/\//g, '_')
    });
    return oService;
  }

  __hasService(oService) {
    return this.__findService(oService) >= 0;
  }

  __findService(oService) {
    return this.serviceMap.findIndex(service => service.url === oService.url && service.method === oService.method && service.param === oService.param);
  }

  addServiceURL(oService) {
    return new Promise((resolve, reject) => {
      // only get can support multi param
      if (!this.__hasService(oService)) {
        const __service = Object.assign({}, oService);
        __service.data = null;
        this.serviceMap.push(__service);
        this.__saveServiceList(oService)
          .then(data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        resolve('no_change');
      }
    });
  }

  generatePath(oService) {
    return oService.path || `${path.join(this.serviceRoot, oService.method, oService.fileName)}.json`;
  }

  __generateKey(oService) {
    return oService.param && oService.param.length > 0 ? oService.param : 'data';
  }

  addService(oService) {
    const _path = this.generatePath(oService);
    // support multi-param only for GET method
    const _key = this.__generateKey(oService);
    const __cacheData = {
      headers: oService.headers || null,
      body: oService.data
    };
    return new Promise((resolve, reject) => {
      fs.readFile(_path, 'utf8', (err, data) => {
        if (err) {
          const _oCache = {};
          _oCache[_key] = __cacheData;

          utils
            .safeWriteFile(_path, JSON.stringify(_oCache), 'utf8')
            .then(() => resolve(oService))
            .catch(error => {
              reject(error);
            });
        } else {
          try {
            const cacheData = JSON.parse(data);
            cacheData[_key] = __cacheData;
            utils
              .safeWriteFile(_path, JSON.stringify(cacheData), 'utf8')
              .then(() => resolve(oService))
              .catch(error => reject(error));
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  __deleteService(oService) {
    const _path = this.generatePath(oService);
    return new Promise((resolve, reject) => {
      if (oService.param && oService.param.length > 0) {
        fs.readFile(_path, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            resolve('no-data');
          } else {
            const oData = JSON.parse(data);
            delete oData[oService.param];
            fs.writeFile(_path, JSON.stringify(oData), 'utf8', error => {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                resolve(oService);
              }
            });
          }
        });
      } else {
        fs.unlink(_path, err => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(oService);
          }
        });
      }
    });
  }

  deleteService(oService) {
    return new Promise((resolve, reject) => {
      if (!this.__hasService(oService)) {
        resolve('no_change');
      } else {
        this.serviceMap.splice(this.__findService(oService), 1);
        Promise.all([this.__saveServiceList(oService), this.__deleteService(oService)])
          .then(data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }

  loadServiceData(oService) {
    return this.loader.loadServiceData(this.generatePath(oService), this.__generateKey(oService));
  }

  // __constructServiceObject(req) {

  // 	let oService = {};
  // 	oService.method = req.method.toLowerCase();
  // 	if (oService.method === 'get') {
  // 		// let _aUrl = req.url.split("?");
  // 		// oService.url = _aUrl[0];
  // 		// if (_aUrl[1] && _aUrl[1].length > 0) {
  // 		// 	oService.param = decodeURIComponent(_aUrl[1].replace(/\+/g, '%20'));
  // 		// }
  // 		oService.url = req.url;
  // 	} else {
  // 		oService.url = req.url;
  // 		oService.param = decodeURIComponent(req.bodyData.replace(/\+/g, '%20'));
  // 	}
  // 	oService.path = oService.url.replace(/\//g, "_");
  // 	return oService;
  // }

  tryLoadLocalData(req, res) {
    // 		let oService = this.__constructServiceObject(req);
    const oService = this.__generateConfigFromRequest(req);
    return this.loadServiceData(oService).then(data => {
      let headers = {};
      if (data.headers) {
        headers = typeof data.headers === 'string' ? JSON.parse(data.headers) : data.headers;
        res.writeHead(200, headers);
      } else {
        res.writeHead(200, {
          'Content-Type': constants.MIME.json
        });
      }

      if (this.__shouldHandleZip(headers)) {
        const encoding = headers['content-encoding'];
        const raw = Buffer.from(data.body || data);
        const promiseZip = utils.getCompressMethod(encoding);
        if (promiseZip) {
          return promiseZip(raw).then(gzipedData => {
            res.end(gzipedData);
            return gzipedData;
          });
        }
        console.error(`failed to match zip method for ${encoding}`);
      }
      res.end(data.body || data);
      return data;
    });
  }
}

export default ServiceConfig;
