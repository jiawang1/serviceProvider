import path from 'path';
import utils from '../utils/utils';

/**
 * support SF home page
 * @param config
 */
const getStaticRoute = config => {
  const staticResource = config.get('resourceRoute');
  if (staticResource && staticResource.length > 0) {
    return [
      {
        target: new RegExp(staticResource),
        cb: (req, res, urlPart) => {
          const url = req.url.includes('?') ? req.url.slice(0, req.url.indexOf('?')) : req.url;
          const matched = url.match(urlPart)[0];
          const _path = path.normalize(config.get('rootPath') + matched);
          utils.sendFile(_path, res);
        }
      }
    ];
  }
  return [];
};

export default getStaticRoute;
