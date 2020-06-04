const homedir = require('os').homedir();
const fs = require('fs-extra');
const path = require('path');
const cli = require('./cli');
const { logger, myLogger } = require('porky-helper').logger;

function testName(name) {
	return /^[\w-.]+$/.test(name);
}

module.exports = class Config {
	constructor(name, configDir, defaultConfig = {}) {
		if (!testName(name)) logger.throwErr('The config name is required and legal(^[\\w-.]+$)');
		this._name = name;
		this._configDir = configDir || path.join(homedir, name);
		this._isLimit = Object.keys(defaultConfig).length > 0;
		this._defaultConfig = defaultConfig;
		this._config = fs.readJsonSync(this.configPath, { throws: false }) || {};
		this.mergeDefault(defaultConfig);
	}

	get configDir() {
		return this._configDir;
	}

	get configPath() {
		return path.join(this.configDir, this.fullName);
	}

	get fullName() {
		return `${this._name}.json`;
	}

	getCmd(cmdName) {
		return cli(cmdName, this);
	}

	save() {
		fs.outputJsonSync(this.configPath, this._config, { spaces: 4 });
	}

	keys() {
		return Object.keys(this._config);
	}

	limit(key) {
		return this._isLimit && !(key in this._defaultConfig);
	}

	get(key, showLog) {
		const val = this._config[key] || '';
		showLog && myLogger.log(val);
		return val;
	}

	set(key, val) {
		if (this.limit(key)) {
			logger.error('key dose not exist:', key);
			return;
		}

		this._config[key] = val;
		this.save();
	}

	del(key) {
		if (this.limit(key)) return;
		delete this._config[key];
		this.save();
	}

	toString() {
		return JSON.stringify(this._config, null, 4);
	}

	list(showDefaultConfig) {
		myLogger.info('current config');
		myLogger.log(this.toString());
		if (showDefaultConfig) {
			myLogger.info('default config');
			myLogger.log(JSON.stringify(this._defaultConfig, null, 4));
		}
	}

	reset() {
		this._config = {};
		this.mergeDefault(this._defaultConfig);
		this.save();
	}

	mergeDefault(config) {
		Object.keys(config).forEach(key => {
			if (this._config[key] === null || this._config[key] === undefined) {
				this._config[key] = config[key];
			}
		});
		return this;
	}
};

module.exports.testName = testName;
