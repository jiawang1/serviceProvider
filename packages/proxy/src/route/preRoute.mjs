import constants from '../utils/constants.mjs';

const getRoute = () => [
  {
    target: /.*/,
    cb: (req, res, pattern, cb) => {
      if (req.url === '/favicon.ico') {
        res.end('');
      } else if (req.method.toUpperCase() === constants.method.httpOptions) {
        // handle preflight for CORS
        if (req.headers['access-control-request-method'] || req.headers['access-control-request-headers']) {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': Object.keys(constants.method)
              .map(key => constants.method[key])
              .join(',')
          });
          res.end('');
        }
      } else if (req.method.toUpperCase() === constants.method.httpPost) {
        // generate request body
        const __aRequstData = [];
        let size = 0;
        req
          .on('data', data => {
            __aRequstData.push(data);
            size += data.length;
          })
          .on('end', () => {
            req.bodyData = Buffer.concat(__aRequstData, size);
            cb(req, res);
          });
      } else {
        cb(req, res);
      }
    }
  }
];

export default getRoute;
