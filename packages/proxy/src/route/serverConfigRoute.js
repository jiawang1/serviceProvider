const fs = require('fs');
const path = require('path');
const constants = require('../utils/constants');

const basePath = 'service-provider-web/_build/';
const servicePrefix = /__service__\/(.*)/;

const isService = urlPath => urlPath.search(servicePrefix) >= 0;

const handleService = (req, res, servicePath, controller) => {
  const [, serviceName] = servicePath.match(servicePrefix);
  if (serviceName === 'serverState') {
    const method = req.method.toLowerCase();
    const { config } = controller;
    if (method === 'get') {
      const results = config.fields.reduce((obj, field) => {
        const model = obj;
        model[field] = config.get(field);
        return model;
      }, {});
      res.writeHead(200, {
        'Content-Type': constants.MIME.json
      });
      res.end(JSON.stringify(results));
    } else if (method === 'post') {
      let oConfig = null;
      try {
        oConfig = JSON.parse(req.bodyData.toString('utf8'));
      } catch (e) {
        res.writeHead(400, {
          'Content-Type': constants.MIME.json
        });
        res.end(JSON.stringify({ message: 'input format is invalidate' }));
        return;
      }
      config
        .saveConfig(oConfig)
        .then(data => {
          res.writeHead(200, {
            'Content-Type': constants.MIME.json
          });
          res.end(JSON.stringify(data));
        })
        .catch(err => {
          res.writeHead(503, {
            'Content-Type': constants.MIME.json
          });
          res.end(JSON.stringify({ error: err.message }));
        });
    }
  }
};

/**
 *
 * @param {*} oController : includes two attributes: server config and service config
 */
const createConfigRoute = oController => [
  {
    target: new RegExp('/__config__(.*)'),
    cb: (req, res, pattern, next) => {
      const matched = req.url.match(pattern);
      if (matched) {
        if (isService(matched[1])) {
          handleService(req, res, matched[1], oController);
          return;
        }
        if (req.url.endsWith('js')) {
          res.writeHead(200, { 'content-type': 'application/javascript' });
        } else if (req.url.endsWith('css')) {
          res.writeHead(200, { 'content-type': 'text/css' });
        } else {
          res.writeHead(200, { 'content-type': 'text/html' });
        }

        const file = matched[1].length > 0 ? matched[1] : 'index.html';
        fs.createReadStream(require.resolve(path.join(basePath, file))).pipe(res);
      } else {
        next(req, res);
      }
    }
  }
];

module.exports = createConfigRoute;
