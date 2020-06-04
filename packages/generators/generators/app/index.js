const path = require('path');
const semver = require('semver');
const validatePackageName = require('validate-npm-package-name');
const _ = require('lodash');
const AbstractGenerator = require('../../src/abstractGenerator');
const generatorPaths = require('../../src');
const { APP } = require('../../src/const');
const { getGenerator } = require('../../src/helper');

const EMPTY_PKG = {};
const configs = {};
const PKG_PROPS = ['name', 'version', 'description', 'keywords', 'author', 'license'];
PKG_PROPS.forEach(prop => {
	configs[prop] = {
		type: String,
		desc: 'Project ' + prop,
	};
});

const generatorNames = [];
_.each(generatorPaths, (generatorPath, name) => {
	if (name !== APP) {
		configs[name] = {
			type: Boolean,
			default: true,
			desc: 'Is add ' + name,
		};
		_.each(getGenerator(name).configs, (config, opt) => {
			configs[opt] = config;
		});
		generatorNames.push(name);
	}
});

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, APP);
		this._pkg = EMPTY_PKG;
		this._repeatAnswers = {};
	}

	initializing() {
		if (this._existPkg()) {
			this._pkg = this._readPkg();
		}

		const opts = this.options;
		// The parameters passed in shall prevail
		PKG_PROPS.forEach(prop => {
			opts[prop] = opts[prop] || this._pkg[prop];
		});
		this._validateName(opts.name);
		this._validateVersion(opts.version);
	}

	_validateName(name) {
		if (!name) return;
		const packageNameValidity = validatePackageName(name);
		if (!packageNameValidity.validForNewPackages) {
			this.emit(
				'error',
				new Error(
					_.get(packageNameValidity, 'errors.0') ||
						'The name option is not a valid npm package name.'
				)
			);
		}
	}

	_validateVersion(version) {
		if (version && !semver.valid(version)) {
			this.emit(
				'error',
				new Error(`The "${version}" option is not a valid npm package version.`)
			);
		}
	}

	_createPrompt(opt) {
		const config = this._options[opt];
		const prompt = {
			type: 'input',
			name: opt,
			message: config.desc,
			when: !this._repeatAnswers[opt],
			default: config.default,
		};
		const result = /options:(\[[\w,"' ]*\])/.exec(config.desc);
		if (result) {
			prompt.type = 'list';
			prompt.choices = JSON.parse(result[1]);
		} else if (config.type === Boolean) {
			prompt.type = 'confirm';
		} else if (config.type === Number) {
			prompt.type = 'number';
		}

		this._repeatAnswers[opt] = true;
		return prompt;
	}

	async _askForInit() {
		// Do not ask when package.json exist
		const opts = this.options;
		if (this._pkg !== EMPTY_PKG) return Promise.resolve(opts);
		const prompts = PKG_PROPS.map(prop => {
			const prompt = this._createPrompt(prop);
			switch (prop) {
				case 'name':
					prompt.default = path.basename(this._destPath());
					prompt.required = true;
					break;
				case 'version':
					prompt.default = '0.0.0';
					break;
				case 'license':
					prompt.default = 'MIT';
					break;
				default:
					break;
			}

			return prompt;
		});

		return this.prompt(prompts).then(props => {
			this._validateName(props.name);
			this._validateVersion(props.version);
			return _.merge(opts, props);
		});
	}

	async prompting() {
		let i = 0;
		return this._askForInit().then(async opts => {
			while (i < generatorNames.length) {
				const generatorName = generatorNames[i];
				await this.prompt([this._createPrompt(generatorName)]).then(async props => {
					_.merge(opts, props);
					if (opts[generatorName]) {
						await this.prompt(
							_.map(getGenerator(generatorName).configs, (config, opt) => {
								return this._createPrompt(opt);
							})
						).then(props => {
							_.merge(opts, props);
						});
					}
				});
				i++;
			}
		});
	}

	default() {
		const opts = this.options;
		generatorNames.forEach(name => {
			if (opts[name]) {
				this.composeWith(generatorPaths[name], opts);
			}
		});

		if (opts.license && !this.fs.exists(this._destPath('LICENSE'))) {
			this.composeWith(require.resolve('generator-license/app'), {
				name: opts.author,
				license: opts.license,
			});
		}
	}

	writing() {
		// Re-read the content at this point because a composed generator might modify it.
		const pkg = this._readPkg();
		const opts = this.options;

		this._pkg === EMPTY_PKG &&
			PKG_PROPS.forEach(prop => {
				if (prop === 'keywords') {
					// Combine the keywords
					pkg[prop] = _.uniq(opts[prop].split(' ').concat(pkg[prop] || []));
				} else {
					pkg[prop] = opts[prop];
				}
			});

		// Let's extend package.json so we're not overwriting user previous fields
		this._writePkg(pkg);
	}

	installing() {
		// This.npmInstall();
	}

	end() {
		this.log('\nAll the files have been created.');
	}
};

module.exports.configs = configs;
