const Generator = require('yeoman-generator');
const { PKG } = require('./const');
const { getTempPath, getConfigName } = require('./helper');

module.exports = class extends Generator {
	constructor(args, options) {
		super(args, options);
		this._name = '';
	}

	option(name, config) {
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

	_readPkg() {
		return this.fs.readJSON(this._destPath(PKG), {});
	}

	_writePkg(pkg) {
		return this.fs.writeJSON(this._destPath(PKG), pkg);
	}
};
