const osenv = require('osenv');
const path = require('path');
const yml = require('./yml');
const { logger, myLogger } = require('porky-helper').logger;

module.exports = class Config {
	constructor(name, configPath) {
		if (!/[\w-$]+/.test(name))
			logger.throwErr('The config name is required and legal(like variable name)');
		this._name = name;
		this._configPath = configPath || osenv.home();
		this._config = yml.safeParse(this.fullPath);
	}

	get configPath() {
		return this._configPath;
	}

	get fullPath() {
		return path.join(this.configPath, this.fullName);
	}

	get fullName() {
		return `.${this._name}.${yml.ext}`;
	}

	save() {
		const obj = yml.safeDump(this.fullPath, this._config);
		yml.isDone(obj) ? logger.success('save success') : logger.throwErr(obj);
	}

	get(key, hideLog) {
		const val = this._config[key] || '';
		!hideLog && myLogger.info(val);
		return val;
	}

	set(key, val) {
		this._config[key] = val.toString();
		this.save();
	}

	del(key) {
		delete this._config[key];
		this.save();
	}

	toString() {
		return JSON.stringify(this._config, null, 4);
	}

	list(json, showConfigPath) {
		showConfigPath && myLogger.info('Config Path:', this._configPath);
		if (json) {
			myLogger.info(this.toString());
		} else {
			Object.keys(this._config).forEach((val, key) => {
				myLogger.info(key, '=', val);
			});
		}
	}

	clear() {
		this._config = {};
		this.save();
	}
};
