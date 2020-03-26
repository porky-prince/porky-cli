const { EDITOR_CONFIG } = require('../../src/const');
const Generator = require('../../src/abstractGenerator');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = EDITOR_CONFIG;
		this._buildDestOpt();
	}

	initializing() {
		this._copyConfigTemp2Dest(this._name);
	}
};
