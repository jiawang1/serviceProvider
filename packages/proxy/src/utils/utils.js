const fs = require('fs');
const path = require('path');
const constants = require('./constants');
const zlib = require("zlib");

const wrapToPromise = (fn, context) => (...args) => {
  return new Promise((resolve, reject) => {
    fn.call(context || null, ...args, (err, ...val) => {
      if (err) {
        reject(err);
      } else {
        resolve(...val);
      }
    });
  });
};

const bind = (fn, context) => {
  return function() {
    return fn.apply(context, [].slice.call(arguments));
  };
};

const sendFile = (filePath, res) => {
  const ext = path
    .extname(filePath)
    .toLowerCase();
  const mime = constants.MIME[ext] || constants.MIME["text"];
  const fileRaw = fs.createReadStream(filePath);

  fileRaw
    .on("open", () => {
      res.writeHead(200, {
        "Cache-Control": "no-cache",
        "Content-Type": mime,
        "content-encoding": "gzip"
      });
    })
    .on("error", err => {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "file not found by proxy";
      res.end(res.statusMessage);
    });
  fileRaw.pipe(zlib.createGzip()).pipe(res);
};

module.exports = {
  sendFile,
  wrapToPromise,
  bind
};

const __isType = type => oTarget =>
  Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, "$1") === type;

/**
 * export functions:
 *  isString
 *  isObject
 *  isNumber
 *  isUndefined
 *  isFunction
 */
const oType = module.exports;
["String", "Object", "Number", "Undefined", "Function"].forEach(_type => {
  oType[`is${_type}`] = __isType(_type);
});
