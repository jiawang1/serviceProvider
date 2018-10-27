// const PouchDB = require("pouchdb"),
import path from 'path';
import fs from 'fs';

class Cache {
  constructor(config) {
    this.cacheFile = path.normalize(config.get('cacheFile'));
    try {
      this.cache = JSON.parse(fs.readFileSync(this.cacheFile, { encoding: 'utf-8' }));
    } catch (e) {
      this.cache = {};
    }
    this.tryLoadLocalData = this.tryLoadLocalData.bind(this);
    this.handlePersistence = this.handlePersistence.bind(this);
  }

  tryLoadLocalData(req, res) {
    return new Promise((resolve, reject) => {
      const __cacheRes = this.cache[this.generateCacheKey(req)];
      if (__cacheRes) {
        res.statusCode = '200';
        Object.keys(__cacheRes.header).forEach(item => {
          res.setHeader(item, __cacheRes.header[item]);
        });
        res.end(__cacheRes.data);
        resolve('done');
      } else {
        reject(new Error('no-data'));
      }
    });
  }

  generateCacheKey(req) {
    return req.method + req.url;
  }

  handlePersistence(req, res) {
    fs.writeFile(this.cacheFile, JSON.stringify(this.cache), err => {
      if (err) {
        res.statusCode = 500;
        res.statusMessage = `persistence cache to file failed: ${err.message} `;
        res.end(res.statusMessage);
        return;
      }
      res.statusCode = 200;
      res.statusMessage = `persistence cache to file ${this.cacheFile} succeed`;
      res.end(res.statusMessage);
    });
  }
}

export default Cache;
