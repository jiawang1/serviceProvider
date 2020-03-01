import path from 'path';
import utils from '../utils/utils.mjs';

/**
 * support SF home page
 * @param config
 */
const getRoutes = config => {
  const ROOT = config.get('rootPath');
  return [
    {
      target: new RegExp(/^\/ui\/surj\/resources(_[^/]+)\/.*\/library(.*)\.(js|css)$/),
      cb: (req, res) => {
        // const relativePath = '/idl-surj/idl-surj-sap.sf.surj.shell-web/src/main/uilib/sap/sf/surj/shell/library-preload.js';
        const basePath = '/idl-surj/idl-surj-sap.sf.surj.shell-web/src/main/uilib/';
        const relativePath = req.url.split(/\/resources_[^/]+\//)[1];
        // "/ui/surj/resources_E4DCE7FE2D42EC1D27A1BE0DD2A5C585/sap/sf/surj/shell/themes/sap_belize/library.css"
        // "/ui/surj/resources_E4DCE7FE2D42EC1D27A1BE0DD2A5C585/sap/sf/surj/shell/library-preload.js"
        // const matched = req.url.match(pattern);
        const filePath = path.join(ROOT, basePath, relativePath);
        utils.sendFile(filePath, res);
      }
    }
  ];
};

export default getRoutes;
