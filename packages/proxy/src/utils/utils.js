const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const constants = require('./constants');

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

const bind = (fn, context) =>
  function() {
    return fn.apply(context, [].slice.call(arguments));
  };

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

const safeWriteFile = (_path, content, encode = 'utf8', surePath = '') => {
  let root = '';
  let unsurePath = _path;
  const promiseWriteFile = wrapToPromise(fs.writeFile);
  const promiseMkDir = wrapToPromise(fs.mkdir);
  if (surePath.length > 0 && _path.startsWith(surePath)) {
    root = surePath;
    unsurePath = _path.slice(surePath.length);
  }

  return unsurePath.split('/').reduce(
    (pro, current) =>
      pro.then(_root => {
        if (current.length === 0) {
          return _root;
        }
        const currentPath = path.join(_root, current);
        if (currentPath.endsWith(unsurePath)) {
          return promiseWriteFile(currentPath, content, encode);
        }
        return promiseMkDir(currentPath).then(() => currentPath);
      }),
    Promise.resolve(root)
  );
};

export { sendFile, wrapToPromise, bind, safeWriteFile };

const __isType = type => oTarget => Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, '$1') === type;

/**
 * export functions:
 *  isString
 *  isObject
 *  isNumber
 *  isUndefined
 *  isFunction
 */
const oType = module.exports;
['String', 'Object', 'Number', 'Undefined', 'Function'].forEach(_type => {
  oType[`is${_type}`] = __isType(_type);
});
