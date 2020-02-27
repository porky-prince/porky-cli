const Generator = require('yeoman-generator');
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

	_copyConfigTemp2Dest(tempName) {
		this.fs.copy(
			this.templatePath(getTempPath(this._name, tempName)),
			this.destinationPath(this.options.generateInto, getConfigName(tempName))
		);
	}
};
