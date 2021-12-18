const AbstractGenerator = require('../../src/abstractGenerator');
const { DepModule, depConfig } = require('../../src/depModule');
const { CLI, CLI_JS } = require('../../src/const');
const path = require('path');
const configs = depConfig({
	cliName: {
		type: String,
		default: path.basename(process.cwd()),
		desc: 'Name of the cli',
	},
});

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, CLI);
	}

	_fillPkg(opts, pkg, devDep, script, dep) {
		dep(new DepModule('commander', '^5.1.0'));
	}

	_copyTempByPkg(opts, pkg, copyTemp) {
		copyTemp('bin', [CLI_JS], /^\./);
		if (!pkg.bin) {
			pkg.bin = {};
			pkg.bin[opts.cliName] = CLI_JS;
		}
	}

	writing() {
		return this._writingByPkg();
	}
};

module.exports.configs = configs;
