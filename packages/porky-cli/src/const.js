const path = require('path');
const ROOT = path.join(__dirname, '..');

module.exports = {
	ROOT,
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
	ENTRY_JS: '.porkyrc.js',
	CONFIG_MARKS: {
		MARK: '@porkyrc',
		NO_RUNTIME: '@noRuntime',
	},
	TEMPS: path.join(__dirname, 'templates'),
};
