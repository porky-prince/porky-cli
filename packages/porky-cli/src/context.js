const { CONFIG_NAME } = require('./const');
const Config = require('porky-config');
const config = new Config(CONFIG_NAME, null, {
	packageManager: 'npm',
	registry: 'https://registry.npmjs.org',
	logLevel: 'all',
});

class Context {
	constructor() {
		this.version = '';
		this._config = config;
		this._plugins = '';
	}

	get config() {
		return this._config;
	}
}

module.exports = new Context();
