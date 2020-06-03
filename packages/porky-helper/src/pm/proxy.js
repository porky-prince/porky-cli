const _ = require('lodash');
const { exec } = require('../helper');
const { logger } = require('../logger');

const defaultOpts = {
	global: false,
	dev: false,
	optional: false,
	exact: false,
	silent: false,
	execOpts: {},
};

// Common pm args
const PM_ARGS = {
	npm: {
		global: '-g',
		dev: '--save-dev',
		optional: '--save-optional',
		exact: '--save-exact',
	},

	yarn: {
		global: 'global',
		dev: '--dev',
		optional: '--optional',
		exact: '--exact',
	},
};

class PmArgs {
	constructor() {
		this._name = 'npm';
	}

	get name() {
		return this._name;
	}

	set name(name) {
		if (PM_ARGS[name.toLowerCase()]) {
			this._name = name.toLowerCase();
		} else {
			logger.throwErr('Not implemented the package manager:' + name);
		}
	}

	cmd(cmd, opts) {
		const args = PM_ARGS[this._name];
		cmd = this._name + (opts.global ? ' ' + args.global : '') + ' ' + cmd;
		if (opts.dev) {
			cmd += ' ' + args.dev;
		} else if (opts.optional) {
			cmd += ' ' + args.optional;
		} else if (opts.exact) {
			cmd += ' ' + args.exact;
		}

		return cmd;
	}
}

/**
 * PM(Package Manager) Proxy
 * Unify some common apis for different package managers
 */
class Proxy {
	constructor() {
		this._pmArgs = new PmArgs();
	}

	options(name, opts) {
		this._pmArgs.name = name;
		this._opts = _.merge({}, defaultOpts, opts);
		return this;
	}

	async exec(cmd, args) {
		const opts = this._opts;
		const argsStr = args && args.length > 0 ? ' ' + args.join(' ') : '';
		await exec(this._pmArgs.cmd(cmd, opts) + argsStr, opts.execOpts, Boolean(opts.silent));
	}

	async install(args) {
		await this.exec('install', args);
	}

	async add(args) {
		await this.exec('add', args);
	}

	async remove(args) {
		await this.exec('remove', args);
	}

	async upgrade(args) {
		await this.exec('upgrade', args);
	}
}

module.exports = new Proxy();
