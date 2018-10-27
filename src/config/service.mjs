import path from 'path';
import View from './View';
import getServerConfig from '../service/ServerConfig';

import constants from '../utils/constants';

const oView = new View();

const createServerRoute = (config, serviceConfig) => (req, res, urlPart) => {
  const handleViewModel = viewName => {
    const _path = path.join('./__public', `${viewName}.ejs`);
    const model = {};
    switch (viewName) {
      case 'config':
        getServerConfig().fields.forEach(field => {
          model[field] = config.get(field);
        });
        return {
          path: _path,
          model: {
            model,
            serviceList: serviceConfig.getServiceList()
          }
        };
      default:
        return {
          path: _path,
          model: {
            model
          }
        };
    }
  };
  function extractParam(sTarget) {
    return sTarget.split('&').map(pair => {
      const aParam = pair.split('=');
      return {
        key: aParam[0],
        val: decodeURIComponent(aParam[1].replace(/\+/g, '%20'))
      };
    });
  }
  function mapParam(pair) {
    if (pair.key === 'serviceUrl') {
      this.url = pair.val;
      this.path = pair.val.replace(/\//g, '_');
    } else if (pair.key === 'serviceData') {
      if (pair.val && pair.val.length > 0) {
        this.data = pair.val;
      }
    } else if (pair.key === 'serviceMethod') {
      this.method = pair.val.toLowerCase();
    } else if (pair.key === 'serviceParam') {
      this.param = pair.val.length > 0 ? pair.val : undefined;
    } else if (pair.key === 'header') {
      this.headers = pair.val;
    }
  }
  debugger;
  const aMathed = req.url
    .match(urlPart)[1]
    .trim()
    .split('?');
  const matched = aMathed[0];
  if (matched.indexOf('/view') === 0) {
    const viewName = matched.slice(1).split('/')[1] || 'config';
    const viewModel = handleViewModel(viewName);
    oView.render(viewModel.path, viewModel.model, req, res);
  } else {
    // handle action from configuration page
    const oService = {};
    if (req.bodyData && typeof req.bodyData !== 'string') {
      req.bodyData = req.bodyData.toString('utf-8');
    }

    switch (matched) {
      case '/save_server_config':
        extractParam(req.bodyData).forEach(pair => {
          config.set(pair.key, pair.val);
        });
        config
          .save()
          .then(() => {
            res.writeHead(200, {
              'Content-Type': constants.MIME.json
            });
            res.end(JSON.stringify({ status: 'sucess' }));
          })
          .catch(err => {
            res.writeHead(200, {
              'Content-Type': constants.MIME.json
            });
            res.end(JSON.stringify({ status: 'sucess', content: err.message }));
          });
        break;

      case '/save_service_config':
        extractParam(req.bodyData).map(mapParam.bind(oService));
        if (oService.data) {
          Promise.all([serviceConfig.addServiceURL(oService), serviceConfig.addService(oService)])
            .then(args => {
              res.writeHead(200, {
                'Content-Type': constants.MIME.json
              });
              res.end(JSON.stringify(args[0]));
            })
            .catch(err => {
              res.statusCode = 500;
              res.statusMessage = err.message;
              res.end(res.statusMessage);
            });
        } else {
          serviceConfig
            .addServiceURL(oService)
            .then(args => {
              res.writeHead(200, {
                'Content-Type': constants.MIME.json
              });
              res.end(JSON.stringify(args));
            })
            .catch(err => {
              res.statusCode = 500;
              res.statusMessage = err.message;
              res.end(res.statusMessage);
            });
        }
        break;
      case '/delete_service_config':
        extractParam(req.bodyData).map(mapParam.bind(oService));
        serviceConfig
          .deleteService(oService)
          .then(data => {
            res.writeHead(200, {
              'Content-Type': constants.MIME.json
            });
            res.end(JSON.stringify({ url: data }));
          })
          .catch(err => {
            res.statusCode = 500;
            res.statusMessage = err.message;
            res.end(res.statusMessage);
          });
        break;
      case '/load_service':
        extractParam(aMathed[1]).map(mapParam.bind(oService));
        serviceConfig
          .loadServiceData(oService)
          .then(data => {
            res.writeHead(200, {
              'Content-Type': constants.MIME.json
            });
            oService.data = data.body || data;
            res.end(JSON.stringify(oService));
          })
          .catch(() => {
            res.writeHead(200, {
              'Content-Type': constants.MIME.json
            });
            oService.data = 'no-data';
            res.end(JSON.stringify(oService));
          });
        break;
      case '/sync_all':
        // const count = serviceConfig.getServiceList().length;
        // const aSuccessResults = [];
        // const aFailedResults = [];
        // function waitResult() {
        //   if (aSuccessResults.length + aFailedResults.length === count) {
        //     res.end(
        //       JSON.stringify({
        //         success: aSuccessResults,
        //         failed: aFailedResults
        //       })
        //     );
        //   }
        // }
        // batchSyncService(res).map(results => {
        //   results
        //     .then(oResult => {
        //       aSuccessResults.push(oResult.service);
        //       waitResult();
        //     })
        //     .catch(oResult => {
        //       aSuccessResults.push(oResult.service);
        //       waitResult();
        //     });
        // });
        break;

      default:
        break;
    }
  }

  // function batchSyncService(response) {
  //   return serviceConfig.getServiceList().map(oService => {
  //     const oRequestDuck = {
  //       headers: {
  //         'content-type': 'application/json',
  //         accept: 'application/json',
  //         '__ignore-cache__': true
  //       },
  //       url: oService.url,
  //       method: oService.method
  //     };
  //     if (
  //       oRequestDuck.method.toUpperCase() === constants.method.httpPost &&
  //       oService.param &&
  //       oService.param.length > 0
  //     ) {
  //       oRequestDuck.bodyData = oService.param;
  //     }
  //     return requestRemoteServer(req, response);
  //   });
  // }
};

export default createServerRoute;
