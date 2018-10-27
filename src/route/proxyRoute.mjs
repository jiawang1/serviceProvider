import constants from '../utils/constants';
import remoteWrapper from '../service/remoteWrapper';

const getDataSource = () =>
  config.get('workingMode') === constants.workingMode.proxyCache ? oCache : serviceConfig;

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

const createProxyRoute = (config, serviceConfig) => {
  const requestRemoteServer = remoteWrapper(config);
  return (req, res) => {
    debugger;
    // var __ignoreCache = _reqeustHeader['__ignore-cache__'];

    const _handleResponse = (hostRes, request, response) =>
      config.get('sync') === 'true'
        ? handleRemoteRes(hostRes, request, response, serviceConfig.generateCacheStream.bind(serviceConfig))
        : handleRemoteRes(hostRes, request, response);

    if (Number(config.get('workingMode')) === constants.workingMode.dataProvider) {
      // cache only
      getDataSource()
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
        getDataSource()
          .tryLoadLocalData(req, res)
          .then(() => {
            console.log(`find in cache ${req.url}`);
          })
          .catch(err => {
            console.log(err.stack || err);
            requestRemoteServer(req, res)
              .then(hostRes => _handleResponse(hostRes, req, res))
              .catch(error => {
                responseError(error, res);
              });
          });
      } else if (Number(config.get('cacheStrategy')) === constants.cacheStrategy.remoteFirst) {
        requestRemoteServer(req, res)
          .then(hostRes => _handleResponse(hostRes, req, res))
          .catch(() =>
            getDataSource()
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
          console.error(`failed to find in cache ${req.url}`);
          responseError(err, res);
        });
    }
  };
};

export default createProxyRoute;
