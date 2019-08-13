import path from 'path';
import utils from '../utils/utils';

/**
 * support SF home page
 * @param config
 */
const getRoutes = config => {
  const ROOT = config.get('rootPath');
  debugger;
  return [
    {
      target: new RegExp(/^\/ui\/todo\/.*\/[^/]+(_[^/]{32})\.(js|css)$/), // todo project
      cb: (req, res, pattern) => {
        const relativePath = '/au-todo/au-todo-web/src/main/webapp';
        const matched = req.url.match(pattern);
        const filePath = path.join(ROOT, relativePath, req.url.replace(matched[1], ''));
        utils.sendFile(filePath, res);
      }
    }
  ];
};

export default getRoutes;
