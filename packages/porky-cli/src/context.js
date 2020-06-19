const {
	defaultConfig,
	defaultRuntimeConfig,
	config,
	runtimeConfig,
	pluginsConfig,
	customConfig,
} = require('./config');
const path = require('path');
const toJson = require('cmd-to-json');
const {
	_,
	logger: { logger },
} = require('porky-helper');

class Context {
	constructor() {
		this.version = '';
		this._logLevel = config.get('logLevel');
		this._clear = false;
		this._json = null;
	}

	get isInit() {
		return config.isSaved;
	}

	get logLevel() {
		return this._logLevel;
	}

	set logLevel(value) {
		this._logLevel = value;
		logger.level(value);
	}

	get clear() {
		return this._clear;
	}

	set clear(value) {
		this._clear = value;
	}

	get json() {
		return this._json;
	}

	set json(value) {
		this._json = JSON.parse(toJson(value.split(' ')));
	}

	get pluginsConfig() {
		return pluginsConfig;
	}

	get customConfig() {
		return customConfig;
	}

	get runtimeTempDir() {
		return path.join(this.runtimeDir, 'temp');
	}
}

function bindProp(config) {
	return (val, key) => {
		const proto = Context.prototype;
		if (key in proto) return;
		Object.defineProperty(proto, key, {
			get() {
				return config.get(key);
			},
		});
	};
}

_.each(defaultConfig, bindProp(config));

_.each(defaultRuntimeConfig, bindProp(runtimeConfig));

module.exports = new Context();
