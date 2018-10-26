import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import constants from './constants';

const wrapToPromise = (fn, context) => (...args) =>
  new Promise((resolve, reject) => {
    fn.call(context || null, ...args, (err, ...val) => {
      if (err) {
        reject(err);
      } else {
        resolve(...val);
      }
    });
  });

const bind = (fn, context) => (...args) => fn.apply(context, [].slice.call(...args));

const sendFile = (filePath, res) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime = constants.MIME[ext] || constants.MIME.text;
  const fileRaw = fs.createReadStream(filePath);

  fileRaw
    .on('open', () => {
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': mime,
        'content-encoding': 'gzip'
      });
    })
    .on('error', err => {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = 'file not found by proxy';
      res.end(res.statusMessage);
    });
  fileRaw.pipe(zlib.createGzip()).pipe(res);
};

const utils = {
  sendFile,
  wrapToPromise,
  bind
};

const __isType = type => oTarget =>
  Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, '$1') === type;

/**
 * export functions:
 *  isString
 *  isObject
 *  isNumber
 *  isUndefined
 *  isFunction
 */
const oType = utils;
['String', 'Object', 'Number', 'Undefined', 'Function'].forEach(_type => {
  oType[`is${_type}`] = __isType(_type);
});

export default utils;
