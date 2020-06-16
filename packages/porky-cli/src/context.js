const {
	defaultConfig,
	defaultRuntimeConfig,
	config,
	runtimeConfig,
	pluginsConfig,
	customConfig,
} = require('./config');
const path = require('path');
const { NAME } = require('./const');
const { findCmdOpts } = require('./helper');
const {
	_,
	logger: { logger },
} = require('porky-helper');

class Context {
	constructor() {
		this.version = '';
		this._logLevel = config.get('logLevel');
		this._clear = false;
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

	get pluginsConfig() {
		return pluginsConfig;
	}

	get customConfig() {
		return customConfig;
	}

	get runtimeTempDir() {
		return path.join(this.runtimeDir, 'temp');
	}

	mergeGlobalOpts(opts) {
		_.each(findCmdOpts(opts, NAME, ['logLevel', 'clear']), (val, key) => {
			this[key] = val;
		});
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
