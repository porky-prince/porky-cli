const {
	defaultConfig,
	defaultRuntimeConfig,
	config,
	runtimeConfig,
	pluginsConfig,
} = require('./config');
const _ = require('lodash');

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
