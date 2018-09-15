import zlib from "zlib";
import { Transform } from "stream";

class CacheBranchStream extends Transform {
  constructor(promiseCB) {
    super();
    this.cb = promiseCB;
    this.chunks = [];
    this.size = 0;
  }

  _transform(chunk, encoding, cb) {
    this.chunks.push(chunk);
    this.size += chunk.length;
    cb(null, chunk);
  }

  _flush(done) {
    let data = new Buffer(this.size);
    let pos = 0;
    this.chunks.forEach(chunk => {
      chunk.copy(data, pos);
      pos += chunk.length;
    });

    this.cb(data.toString())
      .then(() => {
        return done();
      })
      .catch(err => {
        console.error(err);
        done();
      });
  }
}

export default CacheBranchStream;
