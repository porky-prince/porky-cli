const path = require('path');
const BASE = path.join(__dirname, '..');

module.exports = {
	BASE,
	NAME: 'porky',
	CONFIG: '.porkyrc',
	RUNTIME_CONFIG: '.porkyrc-runtime',
	PLUGINS_CONFIG: '.porkyrc-plugins',
	CUSTOM_CONFIG: '.porkyrc-custom',
	PLUGIN_TYPE: {
		UNKNOWN: 0,
		REMOTE: 1,
		LOCAL: 2,
		FILE: 3,
	},
	CONFIG_JS: '.porkyrc.js',
	PKG: path.join(__dirname, '../package.json'),
	CMDS: path.join(__dirname, 'cmds'),
};
