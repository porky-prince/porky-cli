const path = require('path');
//const chalk = require('chalk');
const semver = require('semver');
const validatePackageName = require('validate-npm-package-name');
const _ = require('lodash');
const AbstractGenerator = require('../../src/abstractGenerator');
const generatorPaths = require('../../src');
const { MAIN } = require('../../src/const');
const { getGenerator } = require('../../src/helper');

const EMPTY_PKG = {};
const configs = {};
const PKG_PROPS = ['name', 'version', 'description', 'keywords', 'author', 'license'];
PKG_PROPS.forEach(prop => {
	configs[prop] = {
		type: String,
		desc: 'The package ' + prop,
	};
});

const generatorNames = [];
_.each(generatorPaths, (generatorPath, name) => {
	if (name !== MAIN) {
		configs[name] = {
			type: Boolean,
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
		super(args, opts, MAIN);
		this._pkg = EMPTY_PKG;
		this._repeatOpts = [];
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
		const opts = this.options;
		const config = this._options[opt];
		const desc = config.desc;
		//todo desc
		// Defaults: input - Possible values: input, number, confirm, list, rawlist, expand, checkbox, password, editor
		const prompt = {
			type: '',
			name: opt,
			message: desc,
			when: !opts[opt],
			default: config.default,
		};
		return prompt;
	}

	async _askForInit() {
		// Do not ask when package.json exist
		if (this._pkg !== EMPTY_PKG) return Promise.resolve();
		const opts = this.options;
		const prompts = PKG_PROPS.map(prop => {
			const prompt = {
				name: prop,
				//message: "Author's Name",
				when: !opts[prop],
				default: '',
			};
			switch (prop) {
				case 'name':
					prompt.default = path.basename(this._destPath());
					break;
				case 'version':
					prompt.default = '1.0.0';
					break;
				case 'license':
					prompt.default = 'MIT';
					break;
			}
			return prompt;
		});

		return this.prompt(prompts).then(props => {
			this._validateName(props.name);
			this._validateVersion(props.version);
			_.merge(opts, props);
		});
	}

	async _askForNext(next) {}

	async prompting() {
		return this._askForInit();
	}

	default() {
		if (this.options.editorconfig) {
			this.composeWith(require.resolve('../editorconfig'));
		}

		this.composeWith(require.resolve('../eslint'));

		this.composeWith(require.resolve('../git'), {
			name: this.props.name,
			githubAccount: this.props.githubAccount,
			repositoryName: this.props.repositoryName,
		});

		this.composeWith(require.resolve('generator-jest/generators/app'), {
			testEnvironment: 'node',
			coveralls: false,
		});

		if (this.options.boilerplate) {
			this.composeWith(require.resolve('../boilerplate'), {
				name: this.props.name,
			});
		}

		if (this.options.cli) {
			this.composeWith(require.resolve('../cli'));
		}

		if (this.options.license && !this.pkg.license) {
			this.composeWith(require.resolve('generator-license/app'), {
				name: this.props.authorName,
				email: this.props.authorEmail,
				website: this.props.authorUrl,
			});
		}

		if (!this.fs.exists(this.destinationPath('README.md'))) {
			this.composeWith(require.resolve('../readme'), {
				name: this.props.name,
				description: this.props.description,
				githubAccount: this.props.githubAccount,
				repositoryName: this.props.repositoryName,
				authorName: this.props.authorName,
				authorUrl: this.props.authorUrl,
				coveralls: this.props.includeCoveralls,
				content: this.options.readme,
			});
		}
	}

	writing() {
		// Re-read the content at this point because a composed generator might modify it.
		const pkg = this._readPkg();
		const opts = this.options;

		PKG_PROPS.forEach(prop => {
			// Combine the keywords
			if (prop === 'keywords') {
				pkg[prop] = _.uniq(opts[prop].split(' ').concat(pkg[prop] || []));
			} else {
				pkg[prop] = opts[prop];
			}
		});

		// Let's extend package.json so we're not overwriting user previous fields
		this._writePkg();
	}

	installing() {
		//this.npmInstall();
	}

	end() {
		this.log('Thanks for using Yeoman.');

		if (this.props.includeCoveralls) {
			let coverallsUrl = chalk.cyan('https://coveralls.io/repos/new');
			this.log(`- Enable Coveralls integration at ${coverallsUrl}`);
		}
	}
};

module.exports.path = __dirname;
module.exports.configs = configs;
