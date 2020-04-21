const fs = require('fs');
const path = require('path');
const { GENERATORS } = require('./const');
fs.readdirSync(GENERATORS).forEach(dirName => {
	exports[dirName] = require.resolve(path.join(GENERATORS, dirName));
});
