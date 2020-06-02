const NpmProxy = require('./npmProxy');
const YarnProxy = require('./yarnProxy');
const { logger } = require('../logger');

const proxies = {
	npm: new NpmProxy(),

	yarn: new YarnProxy(),
};

module.exports = (name, opts) => {
	const proxy = proxies[name.toLowerCase()];
	if (!proxy) logger.throwErr('Not implemented the package manager:' + name);
	return proxy.setOptions(opts);
};
