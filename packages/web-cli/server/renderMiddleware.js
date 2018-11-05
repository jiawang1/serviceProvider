import React from 'react';
import ReactDOMServer from 'react-dom/server';
import path from 'path';
import fs from 'fs';

import App from '../src/App';

export default controller => (req, res, next) => {
  const htmlPath = path.resolve(__dirname, '..', 'build', 'index.html');

  fs.readFile(htmlPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('err', err);
      return res.status(404).end();
    }

    const sHtml = ReactDOMServer.renderToString(<App controller={controller} />);
    return res.send(htmlData.replace('<div id="root"></div>', `<div id="root">${sHtml}</div>`));
  });
};
