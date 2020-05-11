const path = require('path');
const BASE = path.join(__dirname, '..');

module.exports = {
	BASE,
	PKG: path.join(__dirname, '../package.json'),
	CMDS: path.join(__dirname, 'cmds'),
};
