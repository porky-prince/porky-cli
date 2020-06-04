const { CONFIG, PLUGINS_CONFIG } = require('./const');
const path = require('path');
const _ = require('lodash');
const homedir = require('os').homedir();
const Config = require('porky-config');
const configDir = path.join(homedir, CONFIG);
const defaultConfig = {
	packageManager: 'npm',
	registry: 'https://registry.npmjs.org',
	logLevel: 'all',
	runtimeDir: configDir,
};
const config = new Config(CONFIG, configDir, defaultConfig);
const pluginsConfig = new Config(PLUGINS_CONFIG, configDir);

class Context {
	constructor() {
		this.version = '';
	}

	get config() {
		return config;
	}

	get pluginsConfig() {
		return pluginsConfig;
	}
}

_.each(defaultConfig, (val, key) => {
	Object.defineProperty(Context.prototype, key, {
		get() {
			return config.get(key);
		},
	});
});

module.exports = new Context();
