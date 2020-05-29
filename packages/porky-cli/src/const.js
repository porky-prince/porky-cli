const path = require('path');
const BASE = path.join(__dirname, '..');

module.exports = {
	BASE,
	NAME: 'porky',
	CONFIG_NAME: '.porkyrc',
	PKG: path.join(__dirname, '../package.json'),
	CMDS: path.join(__dirname, 'cmds'),
};
