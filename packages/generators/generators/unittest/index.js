const Generator = require('../../src/abstractGenerator');
const { UNIT_TEST } = require('../../src/const');
const { getLatestVersion } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.name = UNIT_TEST;

		this._buildDestOpt();

		this.option('unitTest', {
			type: String,
			default: 'jest',
			desc:
				'Select a unit test module, now only jest, todo options:["jest", "mocha", "jasmine"]',
		});

		this.option('scriptType', {
			type: String,
			default: 'js',
			desc: 'Script type, options:["js", "ts", "es"]',
		});
	}

	initializing() {}

	async _fillPkg(opt, pkg) {
		const done = this.async();
		const arr = [];
		const devDependencies = pkg.devDependencies || {};
		const scripts = pkg.scripts || {};
		const devDep = module => {
			arr.push(
				getLatestVersion(module).then(version => {
					devDependencies[module] = devDependencies[module] || `^${version}`;
				})
			);
		};
		const script = (name, cmd) => {
			scripts[name] = scripts[name] || cmd;
		};

		devDep('jest');

		switch (opt.scriptType) {
			case 'ts':
				devDep('jest');
				break;
			case 'es':
				devDep('jest');
				break;
		}

		script('test', 'jest');

		await Promise.all(arr);
		pkg.devDependencies = devDependencies;
		pkg.scripts = scripts;
		this._writePkg(pkg);
		done();
	}

	writing() {}
};
