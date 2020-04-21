const { EDITOR_CONFIG } = require('../../src/const');
const AbstractGenerator = require('../../src/abstractGenerator');

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, EDITOR_CONFIG);
	}

	_copyTempByPkg() {
		this._copyConfigTemp2Dest(this._name);
	}

	writing() {
		this._writingByPkg();
	}
};

module.exports.path = __dirname;
module.exports.configs = {};
