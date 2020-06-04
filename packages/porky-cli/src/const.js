const path = require('path');
const BASE = path.join(__dirname, '..');

module.exports = {
	BASE,
	NAME: 'porky',
	CONFIG: '.porkyrc',
	PLUGINS_CONFIG: '.porkyrc-plugins',
	PLUGIN_TYPE: {
		UNKNOWN: -1,
		LOST: 0,
		REMOTE: 1,
		LOCAL: 2,
		FILE: 3,
	},
	CONFIG_JS: '.porkyrc.js',
	PKG: path.join(__dirname, '../package.json'),
	CMDS: path.join(__dirname, 'cmds'),
};
