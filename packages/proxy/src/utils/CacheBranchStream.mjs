import { Transform } from 'stream';
import utils from './utils.mjs';

class CacheBranchStream extends Transform {
  constructor(promiseCB, shouldUnzip = false, encoding) {
    super();
    this.cb = promiseCB;
    this.chunks = [];
    this.size = 0;
    this.shouldUnzip = shouldUnzip;
    this.encoding = encoding;
  }

  _transform(chunk, encoding, cb) {
    this.chunks.push(chunk);
    this.size += chunk.length;
    cb(null, chunk);
  }

  _flush(done) {
    const data = Buffer.allocUnsafe(this.size);
    let pos = 0;
    this.chunks.forEach(chunk => {
      chunk.copy(data, pos);
      pos += chunk.length;
    });

    let promiseChain = Promise.resolve(data);

    if (this.shouldUnzip) {
      const unzipMethod = utils.getDeCompressMethod(this.encoding);
      promiseChain = unzipMethod(data);
    }

    promiseChain
      .then(unzipedData => this.cb(unzipedData.toString()))
      .then(() => {
        done();
      })
      .catch(err => {
        console.error(err);
        done();
      });
  }
}

export default CacheBranchStream;
