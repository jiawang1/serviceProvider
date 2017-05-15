const Transform = require("stream").Transform,
    zlib = require("zlib");

class CacheBranchStream extends Transform {

    constructor(promiseCB) {
        this.cb = promiseCB;
    }

    _transform(chunk, encoding, cb) {

        this.chunks.push(chunk);
        this.size += chunk.length;
        cb(null, chunk);
    }

    _flush(done) {

        let data = new Buffer(this.size);
        let pos = 0;
        this.chunks.forEach((chunk) => {
            chunk.copy(data, pos);
            pos += chunk.length;
        });

        this.cb(data.toString()).then(done).catch(err => {
            console.error(err);
            done();
        });
        
    }
}