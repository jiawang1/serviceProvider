const fs = require('fs');
const path = require('path');

const packageMainPath = require.resolve('../build/index.html');

const load = () => fs.createReadStream(packageMainPath);

module.exports = load;
