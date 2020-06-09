import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import constants from './constants.mjs';

const wrapToPromise = (fn, context) => (...args) =>
  new Promise((resolve, reject) => {
    fn.call(context || null, ...args, (err, ...val) => {
      if (err) {
        debugger;
        reject(err);
      } else {
        resolve(...val);
      }
    });
  });

const bind = (fn, context) => (...args) => fn.apply(context, [].slice.call(...args));

const sendFile = (filePath, res) => {
  const ext = path
    .extname(filePath)
    .slice(1)
    .toLowerCase();
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

const __mapZlibMethod = mode => encoding => {
  let promisedMethod = null;
  if (/\bdeflate\b/.test(encoding)) {
    promisedMethod = mode === 'zip' ? wrapToPromise(zlib.deflate) : wrapToPromise(zlib.inflate);
  } else if (/\bgzip\b/.test(encoding)) {
    promisedMethod = mode === 'zip' ? wrapToPromise(zlib.gzip) : wrapToPromise(zlib.unzip);
  } else if (/\bbr\b/.test(encoding)) {
    promisedMethod = mode === 'zip' ? wrapToPromise(zlib.brotliCompress) : wrapToPromise(zlib.brotliDecompress);
  }
  return promisedMethod;
};

const getCompressMethod = __mapZlibMethod('zip');
const getDeCompressMethod = __mapZlibMethod('unzip');

const safeWriteFile = (_path, content, encode = 'utf8', surePath = '') => {
  let root = '';
  let unsurePath = _path;
  const promiseWriteFile = wrapToPromise(fs.writeFile);
  const promiseMkDir = wrapToPromise(fs.mkdir);
  if (surePath.length > 0 && _path.startsWith(surePath)) {
    root = surePath;
    unsurePath = _path.slice(surePath.length);
  }

  const temp = unsurePath.split('/').reduce(
    (pro, current) =>
      pro.then(_root => {
        if (current.length === 0) {
          return _root;
        }
        const currentPath = path.join(`/${_root}`, current);
        if (fs.existsSync(currentPath)) {
          return currentPath;
        }

        if (currentPath.endsWith(unsurePath)) {
          return promiseWriteFile(currentPath, content, encode);
        }
        return promiseMkDir(currentPath).then(() => currentPath);
      }),
    Promise.resolve(root)
  );

  return temp
    .then(() => {
      debugger;
    })
    .catch(e => {
      debugger;
    });
};

const utils = {
  sendFile,
  wrapToPromise,
  bind,
  getCompressMethod,
  getDeCompressMethod,
  safeWriteFile
};

const __isType = type => oTarget => Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, '$1') === type;

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
