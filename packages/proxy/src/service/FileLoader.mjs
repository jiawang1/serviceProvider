import fs from 'fs';
import constants from '../utils/constants.mjs';

// const loadServerConfig = () => {
//   try {
//     fs.statSync(constants.SERVER_CONFIG);
//     const __config = fs.readFileSync(constants.SERVER_CONFIG, 'utf-8');
//     return __config.length > 0 ? JSON.parse(__config) : {};
//   } catch (e) {
//     try {
//       fs.statSync('./_config');
//     } catch (err) {
//       fs.mkdirSync('./_config');
//     }
//     fs.writeFile(constants.SERVER_CONFIG, '');
//     return {};
//   }
// };

const loadServiceMap = () => {
  try {
    const _file = fs.readFileSync(constants.SERVICE_CONFIG);
    return _file.length > 0 ? JSON.parse(_file) : [];
  } catch (e) {
    console.error(`failed to read file ${constants.SERVICE_CONFIG}, will create new empty file`);
    console.error(e.message || e);

    fs.writeFile(constants.SERVICE_CONFIG, '', () => {});
    return [];
  }
};

const loadServiceData = (path, rootKey) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        const responseData = JSON.parse(data);
        resolve(responseData[rootKey] || responseData.data);
      }
    });
  });

export default { loadServiceData, loadServiceMap };
