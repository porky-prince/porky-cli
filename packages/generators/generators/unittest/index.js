const AbstractGenerator = require('../../src/abstractGenerator');
const { depConfig } = require('../../src/depModule');
const Modules = require('./modules');
const { UNIT_TEST, UNIT_TEST_MODULES_JSON, SCRIPT_TYPES_JSON } = require('../../src/const');
const { getTempPath, getTestFilename } = require('../../src/helper');
const configs = depConfig({
	unitTestModule: {
		type: String,
		default: 'jest',
		desc: 'Select a unit test module, now only jest, options:' + UNIT_TEST_MODULES_JSON,
	},
	scriptType: {
		type: String,
		default: 'js',
		desc: 'Script type, options:' + SCRIPT_TYPES_JSON,
	},
});

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, UNIT_TEST);
	}

	_copyTestFile2Dest(moduleName, ext) {
		this.fs.copy(
			this.templatePath(getTempPath(this._name, moduleName)),
			this._destPath(getTestFilename(moduleName, ext))
		);
	}

	_fillPkg(opts, pkg, devDep, script) {
		Modules[opts.unitTestModule](opts, pkg, devDep, script);
	}

	async writing() {
		const moduleName = this.options.unitTestModule;
		if (Modules[moduleName]) {
			await this._writingByPkg();
			this._copyTestFile2Dest(moduleName, this.options.scriptType === 'ts' ? 'ts' : 'js');
		} else {
			console.error(`Unknown: ${moduleName}`);
		}
	}
};

module.exports.configs = configs;
