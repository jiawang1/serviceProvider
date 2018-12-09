import http from 'http';
import https from 'https';
import utils from '../utils/utils';

const reportError = (err, cb) => {
  console.error('error when connect to endpoint site via proxy');
  console.error(err);
  cb.call(null, err);
};

const requestViaProxy = (fn => (...args) => utils.wrapToPromise(fn, null)(...args))((proxyOp, target, cb) => {
  const targetPort = `:${target.port || 443}`;
  const { headers } = target;
  headers.host = target.host + targetPort;
  http
    .request({
      hostname: proxyOp.host,
      port: proxyOp.port,
      method: 'CONNECT',
      agent: false,
      path: target.host + targetPort, // "www3.lenovo.com:443"
      headers
    })
    .on('connect', (proxyRes, socket /* head */) => {
      const ops = {
        socket,
        agent: false,
        hostname: target.host,
        path: target.path,
        method: target.method
      };

      // TODO should take original header
      if (target.auth) {
        ops.headers = { Authorization: target.auth };
      }
      const proxyReq = https
        .request(ops, res => {
          cb.call(null, null, res);
        })
        .on('error', err => {
          reportError(err, cb);
        });
      if (target.bodyData) {
        proxyReq.write(target.bodyData);
      }

      proxyReq.end();
    })
    .on('error', err => {
      reportError(err, cb);
    })
    .end();
});

const requestRemoteServer = config => req => {
  const endServerHost = config.get('endpointServer.host');
  // const __ignoreCache = req.headers['__ignore-cache__'];
  const endServerPort = config.get('endpointServer.port');
  let oAuth;
  if (config.get('endpointServer.user')) {
    const authInfo = `${config.get('endpointServer.user')}:${config.get('endpointServer.password')}`;
    oAuth = `Basic ${Buffer.from(authInfo).toString('base64')}`;
  }
  /*
   * https via proxy, request via tunnel.
   * this kind of request have to create socket to proxy first, the use this as
   * tunnel to connect to end point server
   */
  if (config.isSSL() && config.hasProxy()) {
    return requestViaProxy(config.serverMap.proxy, {
      path: req.url,
      host: endServerHost,
      prot: endServerPort,
      method: req.method,
      auth: oAuth,
      headers: req.headers,
      bodyData: req.bodyData
    });
  }
  const option = {};
  option.method = req.method;
  option.headers = Object.assign({}, req.headers);
  option.headers.host = endServerHost;
  if (option.headers.origin) {
    option.headers.origin = option.headers.origin.replace(/\/\/.*/, `//${endServerHost}`);
  }

  /*
   *  some site will set cookie to stick to specific domain, will check whether
   *  refer will be the same with host
   * */
  delete option.headers.referer;

  if (oAuth) {
    option.headers.Authorization = oAuth;
  }

  if (config.hasProxy()) {
    const oProxy = config.get('proxy');
    option.hostname = oProxy.host;
    option.port = oProxy.port;
    option.path = config.get('endpointServer.address') + req.url;
  } else {
    option.hostname = option.headers.host;
    if (endServerPort) {
      option.port = endServerPort;
    }
    option.path = req.url;
  }

  if (config.isSSL()) {
    // by this way, to get rid of untruseted https site
    option.strictSSL = false;
    option.agent = new https.Agent({
      host: endServerHost,
      port: endServerPort,
      path: req.url,
      rejectUnauthorized: false
    });
  }

  return new Promise((resolve, reject) => {
    const hostRequest = (config.isSSL() ? https : http).request(option, hostRes => {
      debugger;
      if (hostRes.headers['set-cookie']) {
        // eslint-disable-next-line no-param-reassign
        hostRes.headers['set-cookie'] = hostRes.headers['set-cookie'].map(cookie => cookie.replace(/(domain=)(.*)(;)/g, '$1localhost$3'));
      }
      resolve(hostRes);
    });

    hostRequest.on('error', e => {
      debugger
      reject(e);
    });
    hostRequest.setTimeout(100000, () => {
      reject(new Error('request has timeout : 10000'));
    });
    if (req.bodyData) {
      hostRequest.write(req.bodyData); // post request body
    }

    hostRequest.end();
  });
};

export default requestRemoteServer;
