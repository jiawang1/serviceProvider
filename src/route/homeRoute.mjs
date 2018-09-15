
import path from 'path';
import utils from '../utils/utils';

const getRoutes = config => {
  const ROOT = config.get("rootPath");
  return [
    {
      target: new RegExp(/^\/ui\/homepage3\/resources(_[^/]+)\/.*\/hmpg3\/.*/), // todo project
      cb: (req, res, pattern) => {
        const relativePath = "/au-homepage3-sap.sf.hmpg3-web/src/main/webapp";
        const matched = req.url.match(pattern);
        const filePath = path.join(
          ROOT,
          relativePath,
          req.url.replace(matched[1], "")
        );
        utils.sendFile(filePath, res);
      }
    },
    {
      target: new RegExp(/^\/ui\/homepage3\/.*\/framework|todo\/.*/), // home page3 web project
      cb: (req, res) => {
        const relativePath = "/au-homepage3-web/src/main/webapp";
        const __path = req.url.replace("_dev-snapshot", "").replace(/(.*)_.{32}(\.js)$/, '$1$2');
        const filePath = path.join(ROOT, relativePath, __path);
        utils.sendFile(filePath, res);
      }
    }
  ];
};

export default getRoutes;
