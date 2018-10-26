import path from 'path';
import fs from 'fs';
import constants from '../utils/constants';
import CacheStream from '../utils/CacheBranchStream';

class ServiceConfig {
  constructor(config) {
    this.loader = config.getServerLoader();
    this.serviceMap = config.getServerLoader().loadServiceMap();
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

  generateCacheStream(req, hostRes) {
    const oService = this.__generateConfigFromRequest(req, hostRes);
    const cacheFromStream = data => {
      oService.data = data;
      return Promise.all([this.addServiceURL(oService), this.addService(oService)]);
    };
    return new CacheStream(cacheFromStream);
  }

  __generateConfigFromRequest(req, res) {
    const oService = {};
    oService.method = req.method.toLowerCase();
    oService.headers = (res && res.headers) || req.headers;

    /*
         *  supprot request in EF, for get method, just consider url part after ? as param,
         *  for post , the param should be  url part after ? + bodydata in request
         * */

    let aUrl = req.url.split('?');
    oService.url = aUrl[0];

    if (oService.method === constants.method.httpGet) {
      oService.param = aUrl.length > 1 ? decodeURIComponent(aUrl[1]) : undefined;
    } else {
      oService.param =
        aUrl.length > 1
          ? decodeURIComponent(aUrl[1] + '_' + req.bodyData)
          : req.bodyData
            ? decodeURIComponent(req.bodyData)
            : undefined;
    }
    oService.path = this.generatePath({
      method: oService.method,
      path: req.url.replace(/^(.*)\?.*/, '$1').replace(/\//g, '_')
    });
    return oService;
  }

  __hasService(oService) {
    return this.__findService(oService) >= 0;
  }

  __findService(oService) {
    return this.serviceMap.findIndex(service => {
      //	if (oService.method === 'get') {
      return (
        service.url === oService.url && service.method === oService.method && service.param === oService.param
      );
      //		} else {
      //	return service.url === oService.url && service.method === oService.method;
      ///}
    });
  }

  addServiceURL(oService) {
    return new Promise((resolve, reject) => {
      // only get can support multi param
      if (!this.__hasService(oService)) {
        let __service = Object.assign({}, oService);
        __service.data = null;
        this.serviceMap.push(__service);
        this.__saveServiceList(oService)
          .then(data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });

        //			fs.writeFile(SERVICE_CONFIG, JSON.stringify(this.serviceMap), (err)=>{
        //			fs.writeF	if(err){
        //			fs.writeF		reject(err);
        //			fs.writeF	}else{
        //			fs.writeF		resolve(serviceUrl);
        //			fs.writeF	}
        //			fs.writeF});
      } else {
        resolve('no_change');
      }
    });
  }

  generatePath(oService) {
    if (oService.path && oService.path.indexOf('_config') >= 0) {
      return oService.path;
    } else {
      return path.join('./_config', oService.method + oService.path) + '.json';
    }
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
      fs.readFile(_path, 'utf-8', (err, data) => {
        if (err) {
          const _oCache = {};
          _oCache[_key] = __cacheData;
          fs.writeFile(_path, JSON.stringify(_oCache), 'utf-8', err => {
            if (err) {
              reject(err);
            } else {
              resolve(oService);
            }
          });
        } else {
          try {
            const cacheData = JSON.parse(data);
            cacheData[_key] = __cacheData;
            fs.writeFile(_path, JSON.stringify(cacheData), 'utf-8', err => {
              if (err) {
                reject(err);
              } else {
                resolve(oService);
              }
            });
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  __deleteService(oService) {
    var _path = this.generatePath(oService);
    return new Promise((resolve, reject) => {
      if (oService.param && oService.param.length > 0) {
        fs.readFile(_path, 'utf-8', (err, data) => {
          if (err) {
            console.error(err);
            resolve('no-data');
          } else {
            let oData = JSON.parse(data);
            delete oData[oService.param];
            fs.writeFile(_path, JSON.stringify(oData), 'utf-8', err => {
              if (err) {
                console.error(err);
                reject(err);
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
    let oService = this.__generateConfigFromRequest(req);
    return this.loadServiceData(oService).then(data => {
      if (data.headers) {
        const headers = typeof data.headers === 'string' ? JSON.parse(data.headers) : data.headers;
        res.writeHead(200, headers);
      } else {
        res.writeHead(200, {
          'Content-Type': constants.MIME.json
        });
      }

      res.end(JSON.parse(JSON.stringify(data.body || data)));
      return data;
    });
  }
}

export default ServiceConfig;
