const _ = require('lodash');
const { exec } = require('../helper');
const { logger } = require('../logger');

module.exports = class Proxy {
	constructor(name) {
		this._name = name;
		this._opts = {};
	}

	getOptions() {
		return this._opts;
	}

	setOptions(opts) {
		_.merge(this._opts, opts);
		return this;
	}

	async exec(cmd, args) {
		const str = args && args.length > 0 ? ' ' + args.join(' ') : '';
		await exec(cmd + str, this._opts, Boolean(this._opts.silent));
	}

	async install(args) {
		await this.exec(`${this._name} install`, args);
	}

	async add() {
		logger.throwErr('Abstract Method');
	}

	async remove() {
		logger.throwErr('Abstract Method');
	}
};
