import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import ServiceConfig from './service/ServiceConfig.mjs';
import utils from './utils/utils.mjs';
import getServerConfig from './service/ServerConfig.mjs';
import constructRoute from './route/route.mjs';
import getHomeRoutes from './route/homeRoute.mjs';

import getDWRRoutes from './route/dwrRoute.mjs';
import getPreRoutes from './route/preRoute.mjs';
import createServerRoute from './config/configurationService.mjs';
import getProxyRoute from './route/proxyRoute.mjs';
import createConfigRoute from './route/serverConfigRoute.mjs';
import getStaticRoute from './route/staticRoute.mjs';
import getTodoRoutes from './route/todoRoute.mjs';

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
  // ...getDWRRoutes(config),
  ...getStaticRoute(config),
  { target: new RegExp('/__public/'), cb: handleStatic },
  // ...getHomeRoutes(config),
  // ...getTodoRoutes(config),
  // ...getSurjRoutes(config),
  ...getProxyRoute(serviceConfig)
];

const route = constructRoute(aRoutes);
const SSLKeyPath = config.get('SSLKey').length === 0 ? null : path.normalize(config.get('SSLKey'));
const SSLCertPath = config.get('SSLCert').length === 0 ? null : path.normalize(config.get('SSLCert'));
const protocol = config.isSSL() && fs.existsSync(SSLKeyPath) && fs.existsSync(SSLCertPath) ? 'https' : 'http';

const server =
  protocol === 'https'
    ? https.createServer(
        {
          key: fs.readFileSync(SSLKeyPath),
          cert: fs.readFileSync(SSLCertPath)
        },
        route
      )
    : http.createServer(route);

server.listen(config.get('port'));
console.log(`Server is running at ${protocol}://127.0.0.1:${config.get('port')}`);
