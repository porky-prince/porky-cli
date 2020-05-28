const osenv = require('osenv');
const fs = require('fs-extra');
const path = require('path');
const { logger, myLogger } = require('porky-helper').logger;

const test = require('e:\\test.js');
console.log(test);

function testName(name) {
	return /^[\w-.]+$/.test(name);
}

module.exports = class Config {
	constructor(name, configPath) {
		if (!testName(name)) logger.throwErr('The config name is required and legal(^[\\w-.]+$)');
		this._name = name;
		this._configPath = path.join(configPath || osenv.home(), this._name);
		this._config = fs.readJsonSync(this.fullPath, { throws: false }) || {};
	}

	get configPath() {
		return this._configPath;
	}

	get fullPath() {
		return path.join(this.configPath, this.fullName);
	}

	get fullName() {
		return `${this._name}.json`;
	}

	save() {
		fs.outputJsonSync(this.fullPath, this._config, { spaces: 4 });
	}

	keys() {
		return Object.keys(this._config);
	}

	get(key, hideLog) {
		const val = this._config[key] || '';
		!hideLog && myLogger.info(val);
		return val;
	}

	set(key, val) {
		this._config[key] = val;
		this.save();
	}

	del(key) {
		delete this._config[key];
		this.save();
	}

	toString() {
		return JSON.stringify(this._config, null, 4);
	}

	list() {
		myLogger.info(this.toString());
	}

	clear() {
		this._config = {};
		this.save();
	}
};

module.exports.testName = testName;
