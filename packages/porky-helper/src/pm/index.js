const proxy = require('./proxy');

module.exports = (name, opts) => {
	return proxy.options(name, opts);
};
