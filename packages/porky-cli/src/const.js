const path = require('path');
const BASE = path.join(__dirname, '..');

module.exports = {
	BASE,
	NAME: 'porky',
	CONFIG_NAME: '.porkyrc',
	CONFIG_JS: '.porkyrc.js',
	PKG: path.join(__dirname, '../package.json'),
	CMDS: path.join(__dirname, 'cmds'),
};
