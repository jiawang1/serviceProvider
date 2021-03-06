"use strict";
const http = require("http"),
  https = require("https");
const utils = require("../utils/utils");

const requestViaProxy = (fn => (...args) => {
  return utils.wrapToPromise(fn, null)(...args);
})((proxyOp, target, cb) => {
  var targetPort = ":" + (target.port || 443);
  var headers = target.headers;
  headers.host = target.host + targetPort;

  http
    .request({
      hostname: proxyOp.host,
      port: proxyOp.port,
      method: "CONNECT",
      agent: false,
      path: target.host + targetPort, //"www3.lenovo.com:443"
      headers: headers
    })
    .on("connect", (proxyRes, socket, head) => {
      let ops = {
        socket: socket,
        agent: false,
        hostname: target.host,
        path: target.path,
        method: target.method
      };

      //TODO should take original header

      target.auth && (ops.headers = { Authorization: target.auth });
      let proxyReq = https
        .request(ops, res => {
          cb.call(null, null, res);
        })
        .on("error", err => {
          reportError(err, cb);
        });
      target.bodyData && proxyReq.write(target.bodyData);
      proxyReq.end();
    })
    .on("error", err => {
      reportError(err, cb);
    })
    .end();

  function reportError(err, cb) {
    console.error("error when connect to endpoint site via proxy");
    console.error(err);
    cb.call(null, err);
  }
});

const requestRemoteServer = config => (req, res) => {
  var endServerHost = config.get("endpointServer.host") ,
    __ignoreCache = req.headers["__ignore-cache__"],
    endServerPort = config.get("endpointServer.port"),
    oAuth;
  if (config.get("endpointServer.user")) {
    oAuth =
      "Basic " +
      new Buffer(
        config.get("endpointServer.user") +
          ":" +
          config.get("endpointServer.password")
      ).toString("base64");
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
  } else {
    var __option = {};
    __option.method = req.method;
    __option.headers = Object.assign(__option.headers || {}, req.headers);
    __option.headers.host = endServerHost;
    if (__option.headers.origin) {
      __option.headers.origin = __option.headers.origin.replace(
        /\/\/.*/,
        `//${endServerHost}`
      );
    }

    /*
         *  some site will set cookie to stick to specific domain, will check whether
         *  refer will be the same with host
         * */
    delete __option.headers.referer;

    oAuth && (__option.headers.Authorization = oAuth);
    if (config.hasProxy()) {
      let oProxy = config.get("proxy");
      __option.hostname = oProxy.host;
      __option.port = oProxy.port;
      __option.path = config.get("endpointServer.address") + req.url;
    } else {
      __option.hostname = __option.headers.host;
      endServerPort && (__option.port = endServerPort);
      __option.path = req.url;
    }

    if (config.isSSL()) {
      // by this way, to get rid of untruseted https site
      __option.strictSSL = false;
      __option.agent = new https.Agent({
        host: endServerHost,
        port: endServerPort,
        path: req.url,
        rejectUnauthorized: false
      });
    }

    return new Promise((resolve, reject) => {
      var __req = (config.isSSL() ? https : http).request(__option, hostRes => {
        // if (Math.floor(hostRes.statusCode / 100) >= 4) {
        // 	let err = new Error(`request failed with status code ${hostRes.statusCode}`);
        // 	err.statusCode = hostRes.statusCode;
        // 	reject(err);
        // } else {
        // 	resolve(hostRes);
        // }

        if (hostRes.headers["set-cookie"]) {
          hostRes.headers["set-cookie"] = hostRes.headers["set-cookie"].map(
            cookie => {
              return cookie.replace(/(domain=)(.*)(;)/, "$1localhost$3");
            }
          );
        }
        resolve(hostRes);
      });
      __req.on("error", e => {
        reject(e);
      });
      __req.setTimeout(100000, () => {
        reject(new Error("request has timeout : 10000"));
      });
      req.bodyData && __req.write(req.bodyData); // post request body
      if (req.bodyData) {
        console.log(req.bodyData.length);
      }

      __req.end();
    });
  }
};

module.exports = requestRemoteServer;
