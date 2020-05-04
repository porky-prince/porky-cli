const AbstractGenerator = require('../../src/abstractGenerator');
const { CLI, CLI_JS } = require('../../src/const');

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, CLI);
	}

	_fillPkg(opts, pkg, devDep, script, dep) {
		dep('commander');
	}

	_copyTempByPkg(opts, pkg, copyTemp) {
		copyTemp('bin', [CLI_JS], /^\./);
		pkg.bin = pkg.bin || CLI_JS;
	}

	writing() {
		return this._writingByPkg();
	}
};

module.exports.configs = {};
