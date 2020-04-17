const Generator = require('../../src/abstractGenerator');
const { CLI, CLI_JS } = require('../../src/const');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = CLI;

		this._buildDestOpt();
	}

	_fillPkg(opt, pkg, devDep, script, dep) {
		dep('commander');
	}

	_copyCfgByPkg(opt, pkg, copyCfg) {
		copyCfg('bin', [CLI_JS], /^\./);
		pkg.bin = pkg.bin || CLI_JS;
	}

	writing() {
		this._writingByPkg();
	}
};
