const { CONFIG, RUNTIME_CONFIG, PLUGINS_CONFIG, CUSTOM_CONFIG } = require('./const');
const {
	_,
	logger: { logLevels },
} = require('porky-helper');
const path = require('path');
const homedir = require('os').homedir();
const Config = require('porky-config');
const configDir = path.join(homedir, CONFIG);
const defaultConfig = {
	packageManager: {
		type: 'list',
		message: 'select a package manager',
		choices: ['npm', 'yarn'],
		default: 'npm',
	},
	registry: {
		type: 'input',
		message: 'input the package registry',
		default: 'https://registry.npmjs.org',
	},
	logLevel: {
		type: 'list',
		message: 'log4js log level',
		choices: logLevels,
		default: 'all',
	},
};
const defaultRuntimeConfig = {
	runtimeDir: {
		type: 'input',
		message: 'command runtime directory',
		default: configDir,
	},
};
const config = new Config(CONFIG, configDir, config2KeyVal(defaultConfig));
const runtimeConfig = new Config(RUNTIME_CONFIG, configDir, config2KeyVal(defaultRuntimeConfig));
const pluginsConfig = new Config(PLUGINS_CONFIG, configDir);
const customConfig = new Config(CUSTOM_CONFIG, configDir);

function config2KeyVal(configObj) {
	const obj = {};
	_.each(configObj, (val, key) => {
		obj[key] = val.default;
	});
	return obj;
}

module.exports = {
	defaultConfig,

	defaultRuntimeConfig,

	config,

	runtimeConfig,

	pluginsConfig,

	customConfig,
};
