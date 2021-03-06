import constants from '../utils/constants.mjs';
import remoteWrapper from '../service/remoteWrapper.mjs';
import Cache from '../service/ProxyCache.mjs';
import getServerConfig from '../service/ServerConfig.mjs';

const oCache = new Cache(getServerConfig());

const getDataSource = (config, serviceConfig) => (config.get('workingMode') === constants.workingMode.proxyCache ? oCache : serviceConfig);

function replaceDomain(url, domain) {
  return url.replace(/^(http(?:s)?:\/\/)(?:[^/]+)(\/.*)$/, `$1${domain}$2`);
}

function responseError(err, res) {
  console.error(err.stack || err);
  res.statusCode = err.statusCode || 503;
  res.statusMessage = err.message;
  res.end(err.message);
}

function retrieveDomainName(url) {
  const aResults = url.match(/^http(?:s)?:\/\/([^/]+)\/.*$/);
  return aResults && aResults[1];
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
      retrieveDomainName(redirect)
      // && retrieveDomainName(redirect) === config.get('endpointServer.host') //TODO this should consider how to redirect
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

const createProxyRoute = serviceConfig => {
  const config = getServerConfig();
  const requestRemoteServer = remoteWrapper(config);
  return (req, res) => {
    debugger;
    const handleResponseWithCache = (hostRes, request, response) => {
      debugger;
      const syncStatus = config.get('sync');
      return syncStatus === 'true'
        ? handleRemoteRes(hostRes, request, response, serviceConfig.generateCacheStream.bind(serviceConfig))
        : handleRemoteRes(hostRes, request, response);
    };

    if (Number(config.get('workingMode')) === constants.workingMode.dataProvider) {
      // cache only
      getDataSource(config, serviceConfig)
        .tryLoadLocalData(req, res)
        .catch(() => {
          res.statusCode = 404;
          res.end(`can not find cache for ${req.url}`);
        });
    } else if (Number(config.get('workingMode')) === constants.workingMode.serviceProvider) {
      if (Number(config.get('cacheStrategy')) === constants.cacheStrategy.cacheFirst) {
        getDataSource(config, serviceConfig)
          .tryLoadLocalData(req, res)
          .then(() => {
            console.log(`find in cache ${req.url}`);
          })
          .catch(e => {
            console.log(e);
            requestRemoteServer(req, res)
              .then(hostRes => handleResponseWithCache(hostRes, req, res))
              .catch(error => {
                responseError(error, res);
              });
          });
      } else if (Number(config.get('cacheStrategy')) === constants.cacheStrategy.remoteFirst) {
        requestRemoteServer(req, res)
          .then(hostRes => handleResponseWithCache(hostRes, req, res))
          .catch(() =>
            getDataSource(config, serviceConfig)
              .tryLoadLocalData(req, res)
              .then(() => {
                console.log(`find in cache ${req.url}`);
              })
              .catch(err => {
                console.error(`failed to find in cache ${req.url}`);
                responseError(err, res);
              })
          );
      }
    } else {
      // for proxy case
      requestRemoteServer(req, res)
        .then(hostRes => handleRemoteRes(hostRes, req, res))
        .catch(err => {
          responseError(err, res);
        });
    }
  };
};

const getProxyRoute = serviceConfig => [
  {
    target: new RegExp('.*'),
    cb: createProxyRoute(serviceConfig)
  }
];

export default getProxyRoute;
