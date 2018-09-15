import fs from "fs";
import path from "path";
import constants from "../utils/constants";

const loadFileSync = filepath => {};

const loadServerConfig = () => {
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
    fs.writeFile(constants.SERVER_CONFIG, "");
    return {};
  }
};

const loadServiceMap = () => {
  try {
    var _file = fs.readFileSync(constants.SERVICE_CONFIG);
    return _file.length > 0 ? JSON.parse(_file) : [];
  } catch (e) {
    console.error(
      `failed to read file ${
        constants.SERVICE_CONFIG
      }, will create new empty file`
    );
    console.error(e.message || e);
    fs.writeFile(constants.SERVICE_CONFIG, "", () => {});
    return [];
  }
};

const loadServiceData = (path, rootKey) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        data = JSON.parse(data);
        resolve(data[rootKey] || data["data"]);
      }
    });
  });
};

export default { loadServerConfig, loadServiceData, loadServiceMap };