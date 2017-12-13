'use strict';

const path = require('path'),
  constants = require('../utils/constants.js'),
  fs = require('fs'),
  zlib = require('zlib');

const aProjects = [
  '(school-ui-activity)/(.*)',
  '(school-ui-activity-container)/(.*)',
  '(school-ui-activity-container-legacy)/(.*)',
  '(school-ui-bootstrap)/(.*)',
  '(school-ui-progress-report)/(.*)',
  '(school-ui-shared)/(.*)',
  '(school-ui-shared-legacy)/(.*)',
  '(school-ui-study)/(.*)',
  '(school-ui-study-legacy)/(.*)',
  '(school-ui-studyplan)/(.*)',
  '(school-ui-studyplan-legacy)/(.*)',
  '(techcheck-ui)/(.*)',
];

const aSolutionProjects = [{key: '(campus-studyplan-ui)/(.*)', path: ''}];

const schoolProject = '/labs-school/$1/src/$3/$2';
const bootstrap = '/labs-school/$1/src/$2';
const commonProject = '/labs-share/ui-shared-dist';
const solutionProject = '/labs-solution';
const snapshot = '/[^/]/snapshot';
const asrPath = '(asr-core/).*(/main.js)';

const sendFile = (_path, res) => {
  let ext = path
    .extname(_path)
    .toLowerCase()
    .replace('.', '');
  let mime = constants.MIME[ext] || constants.MIME['text'];
  let fileRaw = fs.createReadStream(_path);

  fileRaw
    .on('open', () => {
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': mime,
        'content-encoding': 'gzip',
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

/*
 * this function used to handle request for server consiguration page
 * so the path is ../public
 */
const handleServerConfigResource = (req, res, cb, urlPart) => {
  let url = req.url;
  let _path = path.join('..', url);
  sendFile(_path, res);
};

exports.getSchoolRoutes = rootPath => {
  const handleResource = (req, res, next, urlPart) => {
    let matched = null,
      __path = null;
    const urlPath = req.url.match(urlPart)[1]; // urlPart is /_shared/(.*)
    if (aProjects.some(_url => (matched = urlPath.match(_url)) !== null)) {
      let __tmpPath = (matched[0].indexOf('school-ui-bootstrap') >= 0
        ? bootstrap
        : schoolProject
      )
        .replace('$1', matched[1])
        .replace('$2', matched[2]);
      if (__tmpPath.indexOf('snapshot') >= 0) {
        __tmpPath = __tmpPath.replace(/\/[^\/]*\/snapshot/, '');
      } else {
        __tmpPath = __tmpPath.replace(
          '$3',
          matched[0].slice(matched[0].lastIndexOf('.') + 1),
        );
      }
      __path = path.join(rootPath, __tmpPath);
    } else if (
      aSolutionProjects.some(
        _cfg => (matched = urlPath.match(_cfg.key)) !== null,
      )
    ) {
      __path = path.join(
        rootPath,
        solutionProject,
        matched[1],
        matched[2].replace(/(.*)snapshot\/(.*)/, '$1$2'),
      );
    } else if ((matched = urlPath.match(asrPath)) !== null) {
      __path = path.join(
        rootPath,
        'labs-school',
        matched[1],
        'dist',
        matched[2],
      );
    } else {
      /*
             *  for ui-shared-dist content
             * */

      let __aPathes = urlPath.split('/snapshot');

      if (__aPathes.length > 1) {
        const __patentPath = path.join(rootPath, commonProject, __aPathes[0]);
        const __aFiles = fs.readdirSync(__patentPath);

        const __version = __aFiles.reduce((pre, cur) => {
          const __aP = pre.split('.');
          const __aC = cur.split('.');

          for (let i = 0, j = __aP.length; i < j; i++) {
            if (__aP[i] > __aC[i]) {
              return pre;
            } else if (__aP[i] < __aC[i]) {
              return cur;
            }
          }
          return __aP.length > __aC.length ? pre : cur;
        });

        __path = path.join(__patentPath, __version, __aPathes[1]);
      } else {
        __path = path.join(rootPath, commonProject, urlPath);
      }
    }
    sendFile(__path, res);
  };

  return {target: new RegExp('/_shared/(.*)'), cb: handleResource};
};
