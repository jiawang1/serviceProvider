"use strict";

const http = require("http"),
  https = require("https"),
  ServiceConfig = require("./service/ServiceConfig.js"),
  path = require("path"),
  fs = require("fs"),
  PouchDB = require("pouchdb"),
  Cache = require("./service/ProxyCache"),
  View = require("./view/View"),
  utils = require("./utils/utils"),
  ServerConfig = require("./service/ServerConfig"),
  constructRoute = require("./view/route"),
  remoteWrapper = require("./service/remoteWrapper"),
  router = require("./view/ResourceRouter.js"),
  getHomeRoutes = require("./route/homeRoute"),
  getDWRRoutes = require('./route/dwrRoute'),
  constants = require("./utils/constants.js");

/*
 * this function used to handle request for server consiguration page
 * so the path is ../public
  */
function handleStatic(req, res) {
  let url = req.url;
  let _path = path.join("..", url);
  utils.sendFile(_path, res);
}

function handleResource(req, res, urlPart) {
  let matched = req.url.match(urlPart)[0];
  let _path = path.normalize(config.get("rootPath") + matched);
  utils.sendFile(_path, res);
}

const handleViewModel = viewName => {
  let _path = path.join("../__public", viewName + ".ejs");
  let model = {};
  switch (viewName) {
    case "config":
      ServerConfig.fields.forEach(field => {
        model[field] = config.get(field);
      });
      return {
        path: _path,
        model: {
          model: model,
          serviceList: serviceConfig.getServiceList()
        }
      };
    default:
      return {
        path: _path,
        model: {
          model: model
        }
      };
  }
};

/**
 *  used to handle service configuraiton
 * */
function handleServerConfiguration(req, res, urlPart) {
  let aMathed = req.url
    .match(urlPart)[1]
    .trim()
    .split("?");
  let matched = aMathed[0];
  if (matched.indexOf("/view") === 0) {
    let viewName = matched.slice(1).split("/")[1] || "config";
    let viewModel = handleViewModel(viewName);
    oView.render(viewModel.path, viewModel.model, req, res);
  } else {
    // handle action from configuration page
    let oService = {};
    if (req.bodyData && typeof req.bodyData !== "string") {
      req.bodyData = req.bodyData.toString("utf-8");
    }

    switch (matched) {
      case "/save_server_config":
        extractParam(req.bodyData).map(pair => {
          config.set(pair.key, pair.val);
        });
        config
          .save()
          .then(() => {
            res.writeHead(200, {
              "Content-Type": constants.MIME.json
            });
            res.end(JSON.stringify({ status: "sucess" }));
          })
          .catch(err => {
            res.writeHead(200, {
              "Content-Type": constants.MIME.json
            });
            res.end(JSON.stringify({ status: "sucess", content: err.message }));
          });
        break;

      case "/save_service_config":
        extractParam(req.bodyData).map(utils.bind(mapParam, oService));
        if (oService.data) {
          Promise.all([
            serviceConfig.addServiceURL(oService),
            serviceConfig.addService(oService)
          ])
            .then(args => {
              res.writeHead(200, {
                "Content-Type": constants.MIME.json
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
                "Content-Type": constants.MIME.json
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
      case "/delete_service_config":
        extractParam(req.bodyData).map(utils.bind(mapParam, oService));
        serviceConfig
          .deleteService(oService)
          .then(data => {
            res.writeHead(200, {
              "Content-Type": constants.MIME.json
            });
            res.end(JSON.stringify({ url: data }));
          })
          .catch(err => {
            res.statusCode = 500;
            res.statusMessage = err.message;
            res.end(res.statusMessage);
          });
        break;
      case "/load_service":
        extractParam(aMathed[1]).map(utils.bind(mapParam, oService));
        serviceConfig
          .loadServiceData(oService)
          .then(data => {
            res.writeHead(200, {
              "Content-Type": constants.MIME.json
            });
            oService.data = data.body || data;
            res.end(JSON.stringify(oService));
          })
          .catch(err => {
            res.writeHead(200, {
              "Content-Type": constants.MIME.json
            });
            oService.data = "no-data";
            res.end(JSON.stringify(oService));
          });
        break;
      case "/sync_all":
        var count = serviceConfig.getServiceList().length,
          aSuccessResults = [],
          aFailedResults = [];
        function waitResult() {
          if (aSuccessResults.length + aFailedResults.length === count) {
            res.end(
              JSON.stringify({
                success: aSuccessResults,
                failed: aFailedResults
              })
            );
          }
        }
        batchSyncService(res).map(results => {
          results
            .then(oResult => {
              aSuccessResults.push(oResult.service);
              waitResult();
            })
            .catch(oResult => {
              aSuccessResults.push(oResult.service);
              waitResult();
            });
        });
        break;
    }

    function batchSyncService(res) {
      return serviceConfig.getServiceList().map(oService => {
        var oRequestDuck = {
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            "__ignore-cache__": true
          },
          url: oService.url,
          method: oService.method
        };
        if (
          oRequestDuck.method.toUpperCase() === constants.method.httpPost &&
          oService.param &&
          oService.param.length > 0
        ) {
          oRequestDuck.bodyData = oService.param;
        }
        return requestRemoteServer(req, res);
      });
    }

    function mapParam(pair) {
      if (pair.key === "serviceUrl") {
        this.url = pair.val;
        this.path = pair.val.replace(/\//g, "_");
      } else if (pair.key === "serviceData") {
        if (pair.val && pair.val.length > 0) {
          this.data = pair.val;
        }
      } else if (pair.key === "serviceMethod") {
        this.method = pair.val.toLowerCase();
      } else if (pair.key === "serviceParam") {
        this.param = pair.val.length > 0 ? pair.val : undefined;
      }else if (pair.key === 'header'){
        this.headers = pair.val;
      }
    }
  }

  function extractParam(sTarget) {
    return sTarget.split("&").map(pair => {
      let aParam = pair.split("=");
      return {
        key: aParam[0],
        val: decodeURIComponent(aParam[1].replace(/\+/g, "%20"))
      };
    });
  }
}
function retrieveDomainName(url) {
  var aResults = url.match(/^http(?:s)?:\/\/([^\/]+)\/.*$/);
  return aResults && aResults[1];
}

function replaceDomain(url, domain) {
  return url.replace(
    /^(http(?:s)?:\/\/)(?:[^\/]+)(\/.*)$/,
    "$1" + domain + "$2"
  );
}

function errResponse(err, res) {
  console.log(err.stack || err);
  res.statusCode = err.statusCode || 503;
  res.statusMessage = err.message;
  res.end(err.message);
}

function handleRemoteRes(hostRes, req, res, cacheHandler) {
  res.statusCode = hostRes.statusCode;
  var __ignoreCache = req.headers["__ignore-cache__"];
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
  } else if (hostRes.statusCode >= 300 && hostRes.statusCode < 400) {
    console.log(`status is ${hostRes.statusCode}`);
    var redirect = res.getHeader("location");
    if (
      redirect &&
      retrieveDomainName(redirect) &&
      retrieveDomainName(redirect) === config.get("endpointServer.host")
    ) {
      res.setHeader("location", replaceDomain(redirect, req.headers.host));
    }
    hostRes.pipe(res);
    return Promise.resolve();
  } else if (hostRes.statusCode == 401 || hostRes.statusCode == 403) {
    hostRes.pipe(res);
    return Promise.resolve();
  } else if (hostRes.statusCode >= 400) {
    return Promise.reject(hostRes);
  }
}

function serverCb(req, res) {
  var _reqeustHeader = req.headers;
  var __ignoreCache = _reqeustHeader["__ignore-cache__"];

  const _handleResponse = (hostRes, req, res) => {
    return config.get("sync") === "true"
      ? handleRemoteRes(
          hostRes,
          req,
          res,
          utils.bind(serviceConfig.generateCacheStream, serviceConfig)
        )
      : handleRemoteRes(hostRes, req, res);
  };

  if (config.get("workingMode") == constants.workingMode.dataProvider) {
    // cache only
    getDataProxy()
      .tryLoadLocalData(req, res)
      .then(data => {
        console.log("find cache");
      })
      .catch(err => {
        res.statusCode = 404;
        res.end(`can not find cache for ${req.url}`);
      });
  } else if (
    config.get("workingMode") == constants.workingMode.serviceProvider
  ) {
    if (config.get("cacheStrategy") == constants.cacheStrategy.cacheFirst) {
      getDataProxy()
        .tryLoadLocalData(req, res)
        .then(data => {
          console.log(`find in cache ${req.url}`);
        })
        .catch(err => {
          console.log(err.stack || err);
          requestRemoteServer(req, res)
            .then(hostRes => {
              return _handleResponse(hostRes, req, res);
            })
            .catch(err => {
              errResponse(err, res);
            });
        });
    } else if (
      config.get("cacheStrategy") == constants.cacheStrategy.remoteFirst
    ) {
      requestRemoteServer(req, res)
        .then(hostRes => {
          return _handleResponse(hostRes, req, res);
        })
        .catch(err => {
          return getDataProxy()
            .tryLoadLocalData(req, res)
            .then(data => {
              console.log(`find in cache ${req.url}`);
            })
            .catch(err => {
              console.error(`failed to find in cache ${req.url}`);
              errResponse(err, res);
            });
        });
    }
  } else {
    // for proxy case
    requestRemoteServer(req, res)
      .then(hostRes => {
        return handleRemoteRes(hostRes, req, res);
      })
      .catch(err => {
        console.error(`failed to find in cache ${req.url}`);
        errResponse(err, res);
      });
  }
}

function preHandle(req, res, pattern, cb) {
  if (req.url === "/favicon.ico") {
    res.end("");
    return;
  } else if (req.method.toUpperCase() === constants.method.httpOptions) {
    //handle preflight for CORS
    if (
      req.headers["access-control-request-method"] ||
      req.headers["access-control-request-headers"]
    ) {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": Object.keys(constants.method)
          .map(key => constants.method[key])
          .join(",")
      });
      res.end("");
      return;
    }
  } else if (req.method.toUpperCase() === constants.method.httpPost) {
    var __reqBody = "";
    let __aRequstData = [],
      size = 0;
    req
      .on("data", data => {
        __reqBody += data;
        __aRequstData.push(data);
        size += data.length;
      })
      .on("end", () => {
        //req.bodyData = __reqBody;
        req.bodyData = Buffer.concat(__aRequstData, size);
        cb(req, res);
      });
  } else {
    cb(req, res);
  }
}
var config = new ServerConfig();
var serviceConfig = new ServiceConfig(config);
var oCache = new Cache(config);
var oView = new View();
const getDataProxy = () => {
  return config.get("workingMode") == constants.workingMode.proxyCache
    ? oCache
    : serviceConfig;
};

const aRoutes = [
  { target: new RegExp(".*"), cb: preHandle },
  {
    target: new RegExp("_service_persistent"),
    cb: utils.bind(oCache.handlePersistence, oCache)
  },
  {
    target: new RegExp("/__server_config__(.*)"),
    cb: handleServerConfiguration
  },
  ...getDWRRoutes(config),
  { target: new RegExp(config.get("resourceRoute")), cb: handleResource },
  { target: new RegExp("/__public/"), cb: handleStatic },
  ...getHomeRoutes(config),
  { target: new RegExp(".*"), cb: serverCb }
];
const route = constructRoute(aRoutes);
const requestRemoteServer = remoteWrapper(config);

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

server.listen(config.get("port"));
console.log(`Server is running at 127.0.0.1 , port ${config.get("port")}`);
