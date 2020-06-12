const {
	defaultConfig,
	defaultRuntimeConfig,
	config,
	runtimeConfig,
	pluginsConfig,
	customConfig,
} = require('./config');
const path = require('path');
const { _ } = require('porky-helper');

class Context {
	constructor() {
		this.version = '';
	}

	get isInit() {
		return config.isSaved;
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
		Object.defineProperty(Context.prototype, key, {
			get() {
				return config.get(key);
			},
		});
	};
}

_.each(defaultConfig, bindProp(config));

_.each(defaultRuntimeConfig, bindProp(runtimeConfig));

module.exports = new Context();
