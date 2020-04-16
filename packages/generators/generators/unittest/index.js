const Generator = require('../../src/abstractGenerator');
const Modules = require('./modules');
const { UNIT_TEST, UNIT_TEST_MODULES_JSON, SCRIPT_TYPES_JSON } = require('../../src/const');
const { getTempPath, getTestFilename } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = UNIT_TEST;

		this._buildDestOpt();

		this.option('unitTest', {
			type: String,
			default: 'jest',
			desc: 'Select a unit test module, now only jest, options:' + UNIT_TEST_MODULES_JSON,
		});

		this.option('scriptType', {
			type: String,
			default: 'js',
			desc: 'Script type, options:' + SCRIPT_TYPES_JSON,
		});
	}

	_copyTestFile2Dest(moduleName) {
		this.fs.copy(
			this.templatePath(getTempPath(this._name, moduleName)),
			this._destPath(getTestFilename(moduleName))
		);
	}

	_fillPkg(opt, pkg, devDep, script) {
		Modules[opt.unitTest](opt, pkg, devDep, script);
	}

	writing() {
		const moduleName = this.options.unitTest;
		if (Modules.hasOwnProperty(moduleName)) {
			this._writingByPkg();
			this._copyTestFile2Dest(moduleName);
		} else {
			console.error(`Unknown: ${moduleName}`);
		}
	}
};
