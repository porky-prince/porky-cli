const Generator = require('yeoman-generator');
const { PKG } = require('./const');
const { getTempPath, getConfigName } = require('./helper');

module.exports = class extends Generator {
	constructor(args, options) {
		super(args, options);
		this._name = '';
	}

	_buildDestOpt() {
		this.option('generateInto', {
			type: String,
			required: false,
			defaults: '',
			desc: 'Relocate the location of the generated files.',
		});
	}

	_destPath() {
		const args = Array.prototype.slice.call(arguments);
		args.unshift(this.options.generateInto);
		return this.destinationPath.apply(this, args);
	}

	_copyConfigTemp2Dest(tempName) {
		this.fs.copy(
			this.templatePath(getTempPath(this._name, tempName)),
			this._destPath(getConfigName(tempName))
		);
	}

	_readPkg() {
		return this.fs.readJSON(this._destPath(PKG), {});
	}

	_writePkg(pkg) {
		return this.fs.writeJSON(this._destPath(PKG), pkg);
	}
};
