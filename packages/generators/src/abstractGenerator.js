const Generator = require('yeoman-generator');
const _ = require('lodash');
const { PKG } = require('./const');
const { getTempPath, getConfigName } = require('./helper');

class AbstractGenerator extends Generator {
	constructor(args, opts, name) {
		super(args, opts);
		this._name = name;
		this._buildDestOpt();
		_.each(this.constructor.configs, (config, opt) => {
			this.option(opt, config);
		});
	}

	option(name, config) {
		if (!config.default) {
			switch (config.type) {
				case String:
					config.default = '';
					break;
				case Boolean:
					config.default = false;
					break;
				case Number:
					config.default = 0;
					break;
				default:
					break;
			}
		}

		if (config.required !== true) {
			config.required = false;
		}

		return super.option(name, config);
	}

	_buildDestOpt() {
		this.option('generateInto', {
			type: String,
			defaults: '',
			desc: 'Relocate the location of the generated files.',
		});
	}

	_destPath() {
		const args = Array.prototype.slice.call(arguments);
		args.unshift(this.options.generateInto);
		return this.destinationPath.apply(this, args);
	}

	_copyConfigTemp2Dest(tempName, exclude) {
		this.fs.copy(
			this.templatePath(getTempPath(this._name, tempName)),
			this._destPath(getConfigName(tempName, exclude))
		);
	}

	_copyConfigTemps2Dest(tempNames, exclude) {
		tempNames.forEach(tempName => {
			this._copyConfigTemp2Dest(tempName, exclude);
		});
	}

	_existPkg() {
		return this.fs.exists(this._destPath(PKG));
	}

	_readPkg() {
		return this.fs.readJSON(this._destPath(PKG), {});
	}

	_writePkg(pkg) {
		return this.fs.writeJSON(this._destPath(PKG), pkg, null, 4);
	}

	async _writingByPkg() {
		const opts = this.options;
		const pkg = this._readPkg();

		const copyTemp = (config, tempNames, exclude) => {
			!pkg[config] && this._copyConfigTemps2Dest(tempNames, exclude);
		};

		this._copyTempByPkg(opts, pkg, copyTemp);

		await this.__fillPkg(opts, pkg);
	}

	_copyTempByPkg() {}

	__fillDepVersion(opts, dep) {
		return (...depModules) => {
			depModules.forEach(depModule => {
				dep[depModule.getName()] = dep[depModule.getName()] || depModule.getVersion(opts);
			});
		};
	}

	async __fillPkg(opts, pkg) {
		const scripts = pkg.scripts || {};
		const dependencies = pkg.dependencies || {};
		const devDependencies = pkg.devDependencies || {};
		const dep = this.__fillDepVersion(opts, dependencies);
		const devDep = this.__fillDepVersion(opts, devDependencies);
		const script = (name, cmd) => {
			scripts[name] = scripts[name] || cmd;
		};

		this._fillPkg(opts, pkg, devDep, script, dep);
		pkg.scripts = scripts;
		pkg.dependencies = dependencies;
		pkg.devDependencies = devDependencies;
		this._writePkg(pkg);
	}

	_fillPkg() {}
}

module.exports = AbstractGenerator;
