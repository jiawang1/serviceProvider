import http from 'http';
import https from 'https';
import path from 'path';
import ServiceConfig from './service/ServiceConfig';
import Cache from './service/ProxyCache';
import utils from './utils/utils';
import ServerConfig from './service/ServerConfig';
import constructRoute from './route/route';
import remoteWrapper from './service/remoteWrapper';
import getHomeRoutes from './route/homeRoute';
import getDWRRoutes from './route/dwrRoute';
import getPreRoutes from './route/preRoute';
import constants from './utils/constants';
import createServerRoute from './config/service';

const config = new ServerConfig();
const serviceConfig = new ServiceConfig(config);
const oCache = new Cache(config);

const getDataProxy = () =>
  config.get('workingMode') === constants.workingMode.proxyCache ? oCache : serviceConfig;

const requestRemoteServer = remoteWrapper(config);
/*
 * this function used to handle request for server consiguration page
 * so the path is ../public
  */
function handleStatic(req, res) {
  const { url } = req;
  const _path = path.join('.', url);
  utils.sendFile(_path, res);
}

function handleResource(req, res, urlPart) {
  const matched = req.url.match(urlPart)[0];
  const _path = path.normalize(config.get('rootPath') + matched);
  utils.sendFile(_path, res);
}

function retrieveDomainName(url) {
  const aResults = url.match(/^http(?:s)?:\/\/([^/]+)\/.*$/);
  return aResults && aResults[1];
}

function replaceDomain(url, domain) {
  return url.replace(/^(http(?:s)?:\/\/)(?:[^/]+)(\/.*)$/, `$1${domain}$2`);
}

function errResponse(err, res) {
  console.log(err.stack || err);
  res.statusCode = err.statusCode || 503;
  res.statusMessage = err.message;
  res.end(err.message);
}

function handleRemoteRes(hostRes, req, res, cacheHandler) {
  res.statusCode = hostRes.statusCode;
  // const __ignoreCache = req.headers['__ignore-cache__'];
  Object.keys(hostRes.headers).forEach(item => {
    res.setHeader(item, hostRes.headers[item]);
  });
  if (hostRes.statusCode >= 200 && hostRes.statusCode < 300) {
    if (cacheHandler) {
      hostRes.pipe(cacheHandler(req, hostRes)).pipe(res);
    } else {
      hostRes.pipe(res);
    }
    return Promise.resolve();
    // eslint-disable-next-line no-else-return
  } else if (hostRes.statusCode >= 300 && hostRes.statusCode < 400) {
    console.log(`status is ${hostRes.statusCode}`);
    const redirect = res.getHeader('location');
    if (
      redirect &&
      retrieveDomainName(redirect) &&
      retrieveDomainName(redirect) === config.get('endpointServer.host')
    ) {
      res.setHeader('location', replaceDomain(redirect, req.headers.host));
    }
    hostRes.pipe(res);
    return Promise.resolve();
  } else if (hostRes.statusCode === 401 || hostRes.statusCode === 403) {
    hostRes.pipe(res);
    return Promise.resolve();
  }
  return Promise.reject(hostRes);
}

function serverCb(req, res) {
  debugger;
  // var __ignoreCache = _reqeustHeader['__ignore-cache__'];

  const _handleResponse = (hostRes, request, response) =>
    config.get('sync') === 'true'
      ? handleRemoteRes(
          hostRes,
          request,
          response,
          utils.bind(serviceConfig.generateCacheStream, serviceConfig)
        )
      : handleRemoteRes(hostRes, request, response);

  if (Number(config.get('workingMode')) === constants.workingMode.dataProvider) {
    // cache only
    getDataProxy()
      .tryLoadLocalData(req, res)
      .then(() => {
        console.log('find cache');
      })
      .catch(() => {
        res.statusCode = 404;
        res.end(`can not find cache for ${req.url}`);
      });
  } else if (Number(config.get('workingMode')) === constants.workingMode.serviceProvider) {
    if (Number(config.get('cacheStrategy')) === constants.cacheStrategy.cacheFirst) {
      getDataProxy()
        .tryLoadLocalData(req, res)
        .then(() => {
          console.log(`find in cache ${req.url}`);
        })
        .catch(err => {
          console.log(err.stack || err);
          requestRemoteServer(req, res)
            .then(hostRes => _handleResponse(hostRes, req, res))
            .catch(error => {
              errResponse(error, res);
            });
        });
    } else if (Number(config.get('cacheStrategy')) === constants.cacheStrategy.remoteFirst) {
      requestRemoteServer(req, res)
        .then(hostRes => _handleResponse(hostRes, req, res))
        .catch(() =>
          getDataProxy()
            .tryLoadLocalData(req, res)
            .then(() => {
              console.log(`find in cache ${req.url}`);
            })
            .catch(err => {
              console.error(`failed to find in cache ${req.url}`);
              errResponse(err, res);
            })
        );
    }
  } else {
    // for proxy case
    requestRemoteServer(req, res)
      .then(hostRes => handleRemoteRes(hostRes, req, res))
      .catch(err => {
        console.error(`failed to find in cache ${req.url}`);
        errResponse(err, res);
      });
  }
}

const aRoutes = [
  ...getPreRoutes(config),
  {
    target: new RegExp('_service_persistent'),
    cb: oCache.handlePersistence
  },
  {
    target: new RegExp('/__server_config__(.*)'),
    cb: createServerRoute(config, serviceConfig)
  },
  ...getDWRRoutes(config),
  { target: new RegExp(config.get('resourceRoute')), cb: handleResource },
  { target: new RegExp('/__public/'), cb: handleStatic },
  ...getHomeRoutes(config),
  { target: new RegExp('.*'), cb: serverCb }
];
const route = constructRoute(aRoutes);

// const server = !config.isSSL() ? http.createServer(route) : https.createServer({
// 	key: fs.readFileSync(path.normalize(config.get("SSLKey"))),
// 	cert: fs.readFileSync(path.normalize(config.get("SSLCert")))
// }, route);

const server = http.createServer(route);
//
// const server = https.createServer(
//   {
//     key: fs.readFileSync("/Users/i054410/Documents/work/ssl/key.pem", "utf-8"),
//     cert: fs.readFileSync("/Users/i054410/Documents/work/ssl/cert.pem", "utf-8")
//   },
//   route
// );

server.listen(config.get('port'));
console.log(`Server is running at 127.0.0.1 , port ${config.get('port')}`);
