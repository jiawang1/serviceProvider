import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import ServiceConfig from './service/ServiceConfig';
import utils from './utils/utils';
import getServerConfig from './service/ServerConfig';
import constructRoute from './route/route';
import getHomeRoutes from './route/homeRoute';
import getDWRRoutes from './route/dwrRoute';
import getPreRoutes from './route/preRoute';
import createServerRoute from './config/configurationService';
import getProxyRoute from './route/proxyRoute';
import createConfigRoute from './route/serverConfigRoute';

const config = getServerConfig();
const serviceConfig = new ServiceConfig(config);
/*
 * this function used to handle request for server consiguration page
 * so the path is ../public
  */
function handleStatic(req, res) {
  const { url } = req;
  const _path = path.join('.', url);
  utils.sendFile(_path, res);
}

function handleResource(req, res, urlPart) {
  const matched = req.url.match(urlPart)[0];
  const _path = path.normalize(config.get('rootPath') + matched);
  utils.sendFile(_path, res);
}

const aRoutes = [
  ...getPreRoutes(config),
  // {
  //   target: new RegExp('_service_persistent'),
  //   cb: oCache.handlePersistence
  // },
  {
    target: new RegExp('/__server_config__(.*)'),
    cb: createServerRoute(config, serviceConfig)
  },
  ...createConfigRoute({ config, serviceConfig }),
  ...getDWRRoutes(config),
  { target: new RegExp(config.get('resourceRoute')), cb: handleResource },
  { target: new RegExp('/__public/'), cb: handleStatic },
  ...getHomeRoutes(config),
  ...getProxyRoute(serviceConfig)
];
const route = constructRoute(aRoutes);

const server = !config.isSSL()
  ? http.createServer(route)
  : https.createServer(
      {
        key: fs.readFileSync(path.normalize(config.get('SSLKey'))),
        cert: fs.readFileSync(path.normalize(config.get('SSLCert')))
      },
      route
    );

server.listen(config.get('port'));
console.log(`Server is running at 127.0.0.1 , port ${config.get('port')}`);
