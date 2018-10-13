const ejs = require("ejs"),
  zlib = require("zlib");

class View {
  constructor() {
    this.engine = ejs;
  }
  render(viewName, data, req, res) {
    this.engine.renderFile(viewName, data, {}, this.__defaultRender(req, res));
  }

  __defaultRender(req, res) {
    return function(err, str) {
      if (err) {
        console.error(err.message);
        res.writeHead("500", "render error");
        res.end();
        return;
      }
      zlib.gzip(new Buffer(str), (err, buffer) => {
        if (!err) {
          res.writeHead(200, {
            "Content-Type": "text/html",
            "content-encoding": "gzip"
          });
          res.write(buffer);
        } else {
          console.error(err.message);
          res.writeHead("500", "compress error");
        }
        res.end();
      });
    };
  }
}

module.exports = View;
