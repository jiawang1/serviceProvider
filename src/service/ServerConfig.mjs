// const PouchDB = require("pouchdb"),

import fs from 'fs';
import fileLoader from "./FileLoader";
import dbLoader from "./DBLoader";
import constants from "../utils/constants";

class ServerConfig {
  static getDefault() {
    var __map = new Map([
      ["port", 8079],
      ["cacheStrategy", constants.cacheStrategy.remoteFirst],
      ["workingMode", constants.workingMode.dataProvider],
      ["sync", true], // if sync = true , it will update cache automatically after response back from remote server
      ["toDatabase", false],
      ["databaseName", "fivestarDSH"],
      ["endpointServer.address", "https://localhost"],
      //	,["endpointServer.address","https://www3.lenovo.com"]
      ["endpointServer.port", 9002],
      ["endpointServer.host", undefined],
      ["endpointServer.user", undefined],
      ["endpointServer.password", undefined],
      ["cacheFile", "proxyCache.json"],
      ["resourceRoute", "/_ui/(.*)"], //"/webapp/(.*)"
      ["SSLKey", ""],
      ["SSLCert", ""],
      ["rootPath", "/Users/jay.wangef.com/Documents/git/ef"],
      //	,["proxy.host","proxy.pal.sap.corp"]
      //	,["proxy.port",8080]
      ["proxy.host", undefined],
      ["proxy.port", undefined]
    ]);

    let __defaultConfig = {};
    for (let [key, val] of __map) {
      let tmp = __defaultConfig;
      key.split(".").forEach((K, inx, arr) => {
        if (inx === arr.length - 1) {
          tmp[K] = val;
        } else {
          tmp = tmp[K] ? tmp[K] : (tmp[K] = {});
        }
      });
    }
    __defaultConfig.keys = function() {
      return __map.keys();
    };
    ServerConfig.getDefault = function() {
      return __defaultConfig;
    };
    return __defaultConfig;
  }

  static get fields() {
    return Array.from(ServerConfig.getDefault().keys());
  }
  set(key, val) {
    if (ServerConfig.fields.indexOf(key) >= 0) {
      let _o = this.serverMap;
      key.split(".").some((key, inx, arr) => {
        if (inx === arr.length - 1) {
          if (_o[key] !== val) {
            this.isChanged = true;
            _o[key] = val;
          }
          return true;
        } else {
          _o = _o[key];
        }
      });
    }
    return this;
  }
  save() {
    return new Promise((resolve, reject) => {
      if (this.isChanged) {
        fs.writeFile(
          constants.SERVER_CONFIG,
          JSON.stringify(this.serverMap),
          err => {
            if (err) {
              reject(err);
            } else {
              resolve("success");
              this.isChanged = false;
            }
          }
        );
      } else {
        resolve("no change");
      }
    });
  }
  get(key) {
    // if (key === "endpointServer.host") {
    // 	let matched = this.get("endpointServer.address").match(/^http(?:s)?:\/\/([^\/]+)/);
    // 	return matched?matched[1]:'';
    // }
    var _o = this.serverMap;
    key.split(".").forEach(key => {
      _o = _o[key];
    });
    return _o;
  }
  hasProxy() {
    return !!(
      this.get("proxy") &&
      this.get("proxy").host &&
      this.get("proxy").host.length > 0
    );
  }

  isSSL() {
    return this.get("endpointServer.address").indexOf("https") >= 0;
  }

  __retrieveSymbol(key) {
    return (
      this.__symbolMap.get(key) ||
      this.__symbolMap.set(key, Symbol(key)).get(key)
    );
  }

  __loadEnvironmentConfig() {
    const aKeys = ServerConfig.fields;
    var args = {},
      envmap = {};

    // load from package.json first if start up by npm
    aKeys.forEach(key => {
      if (process.env["npm_package_config_" + key]) {
        //	 envmap.set(key, process.env["npm_package_config_" + key]);
        assignValue(key, process.env["npm_package_config_" + key], envmap);
      }
    });

    // load from command line
    process.argv.slice().reduce((pre, item) => {
      let matches;
      if (
        (matches = pre.match(/^--(.*)/)) &&
        aKeys.indexOf(matches[1].toLowerCase()) >= 0
      ) {
        //envmap.set(matches[1].toLowerCase(), item);
        //envmap[matches[1].toLowerCase()] = item;
        assignValue(matches[1].toLowerCase(), item, envmap);
      }
      return item;
    });
    return envmap;
  }
  calConfig() {
    return this;
  }
  loadConfigFile() {
    try {
      fs.statSync(constants.SERVER_CONFIG);
      var __config = fs.readFileSync(constants.SERVER_CONFIG, "utf-8");
      return __config.length > 0 ? JSON.parse(__config) : {};
    } catch (e) {
      try {
        var stat = fs.statSync("./_config");
      } catch (e) {
        fs.mkdirSync("./_config");
      }
      fs.writeFile(constants.SERVER_CONFIG, "", () => {});
      return {};
    }
  }

  getServerLoader() {
    return this.get("toDatabase") === "true" ? dbLoader : fileLoader;
  }

  __initDB(name) {
    dbLoader.initDB(name);
  }
  constructor() {
    this.isChanged = false;
    let defaultMap = ServerConfig.getDefault();
    this.serverMap = {};
    Object.assign(
      this.serverMap,
      defaultMap,
      this.loadConfigFile(),
      this.__loadEnvironmentConfig()
    );
    this.serverMap["toDatabase"] &&
      this.__initDB(this.serverMap["databaseName"]);
  }
}

function assignValue(key, val, oo) {
  key.split(".").forEach((key, inx, arr) => {
    if (inx === arr.length - 1) {
      oo[key] = val;
    } else {
      if (oo[key] === undefined) {
        oo[key] = {};
      }
    }
  });
}

export default ServerConfig;
