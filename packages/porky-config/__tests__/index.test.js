const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Generator = require('yeoman-generator');
const path = require('path');
const configName = '.test';
const configFile = configName + '.json';
const configJson = require('./' + configFile);
const Config = require('../src');

class TestGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.option('createConfig', {
			type: Boolean,
			default: false,
		});
	}

	writing() {
		if (this.options.createConfig) {
			this.fs.writeJSON(this.destinationPath(configName, configFile), configJson);
		}
	}
}

function runByOpt(opts = {}) {
	return helpers.run(TestGenerator).withOptions(opts);
}

describe(require('../package.json').description, () => {
	it('test config name', () => {
		expect(Config.testName('porkyrc')).toBe(true);
		expect(Config.testName('porkyrc_1.0')).toBe(true);
		expect(Config.testName('porky-config')).toBe(true);
		expect(Config.testName('porky config')).toBe(false);
		expect(Config.testName('%porky% $config')).toBe(false);
	});

	function common(config, destPath, hasDefaultConfig) {
		expect(config.get('linuxPath')).toBe(configJson.linuxPath);
		config.del('linuxPath');
		expect(config.get('linuxPath')).not.toBe(configJson.linuxPath);
		const newWinPath = 'C:\\Users\\visitor';
		expect(config.get('winPath')).toBe(configJson.winPath);
		config.set('winPath', newWinPath);
		expect(config.get('winPath')).toBe(newWinPath);
		config.set('other', 'some val');
		expect(config.get('other')).toBe(hasDefaultConfig ? '' : 'some val');
		config = new Config(configName, destPath); // Reload
		expect(config.get('winPath')).toBe(newWinPath);
		expect(config.get('linuxPath')).toBe('');
		expect(config.get('other')).toBe(hasDefaultConfig ? '' : 'some val');
	}

	it('config dose not exist', () => {
		return runByOpt().then(destPath => {
			const configPath = path.join(destPath, configName, configFile);
			assert.noFile(configPath);
			const config = new Config(configName, destPath);
			expect(config.keys().length).toBe(0);
			Object.keys(configJson).forEach(key => {
				config.set(key, configJson[key]);
			});
			assert.jsonFileContent(configPath, configJson);
			common(config, destPath);
		});
	});

	it('config already existed', () => {
		return runByOpt({
			createConfig: true,
		}).then(destPath => {
			const configPath = path.join(destPath, configName, configFile);
			assert.jsonFileContent(configPath, configJson);
			const config = new Config(configName, destPath);
			expect(config.keys().length).toBe(Object.keys(configJson).length);
			common(config, destPath);
		});
	});

	it('config dose not exist and has default config', () => {
		return runByOpt().then(destPath => {
			const configPath = path.join(destPath, configName, configFile);
			assert.noFile(configPath);
			const config = new Config(configName, destPath, configJson);
			expect(config.keys().length).toBe(Object.keys(configJson).length);
			common(config, destPath, true);
		});
	});

	it('config already existed and has default config', () => {
		return runByOpt({
			createConfig: true,
		}).then(destPath => {
			const configPath = path.join(destPath, configName, configFile);
			assert.jsonFileContent(configPath, configJson);
			const config = new Config(configName, destPath, configJson);
			expect(config.keys().length).toBe(Object.keys(configJson).length);
			common(config, destPath, true);
		});
	});
});
