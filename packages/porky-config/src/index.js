const { EventEmitter } = require('events');
const homedir = require('os').homedir();
const fs = require('fs-extra');
const path = require('path');
const cli = require('./cli');

function testName(name) {
	return /^[\w-.]+$/.test(name);
}

const Config = (module.exports = class extends EventEmitter {
	constructor(name, configDir, defaultConfig = {}) {
		super();
		if (!testName(name)) throw new Error('The config name is required and legal(^[\\w-.]+$)');
		this._name = name;
		this._configDir = configDir || path.join(homedir, name);
		this._isLimit = Object.keys(defaultConfig).length > 0;
		this._defaultConfig = defaultConfig;
		const config = fs.readJsonSync(this.configPath, { throws: false });
		this._isSaved = Boolean(config);
		this._config = config || {};
		this.mergeDefault(defaultConfig);
	}

	get isSaved() {
		return this._isSaved;
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

	get(key) {
		const val = this._config[key];
		return val === undefined ? null : val;
	}

	set(key, val) {
		let flag = true;
		const oldVal = this.get(key);
		if (this.limit(key)) {
			flag = false;
		} else {
			this._config[key] = val;
			this.save();
		}

		this.emit('set', key, val, oldVal, flag);
		return flag;
	}

	del(key) {
		let flag = true;
		const oldVal = this.get(key);
		if (this.limit(key)) {
			flag = false;
		} else {
			delete this._config[key];
			this.save();
		}

		this.emit('del', key, oldVal, flag);
		return flag;
	}

	toString() {
		return JSON.stringify(this._config, null, 4);
	}

	list(showDefaultConfig) {
		console.info('current config');
		console.log(this.toString());
		if (showDefaultConfig) {
			console.info('default config');
			console.log(JSON.stringify(this._defaultConfig, null, 4));
		}
	}

	reset() {
		this._config = {};
		this.mergeDefault(this._defaultConfig);
		this.save();
		this.emit('reset');
	}

	mergeDefault(config) {
		Object.keys(config).forEach(key => {
			if (this.get(key) === null) {
				this._config[key] = config[key];
			}
		});
		return this;
	}
});

Config.testName = testName;
