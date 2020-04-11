const fs = require('fs');
const Generator = require('../../src/abstractGenerator');
const { LINT } = require('../../src/const');
const { getTempPath } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opt) {
		super(args, opt);
		this._name = LINT;

		this._buildDestOpt();

		this.option('eslint', {
			type: Boolean,
			default: true,
			desc: 'Using eslint in javascript project',
		});

		this.option('tslint', {
			type: Boolean,
			desc: 'Using eslint in typescript project',
		});
	}

	writing() {
		const opt = this.options;
		const pkg = this._readPkg();
		const devDependencies = pkg.devDependencies || {};
		const scripts = pkg.scripts || {};
		function devDep(module) {
			devDependencies[module] = devDependencies[module] || module;
		}

		function script(name, cmd) {
			scripts[name] = scripts[name] || cmd;
		}

		devDep('eslint');
		devDep('eslint-config-prettier');
		devDep('eslint-plugin-prettier');
		devDep('eslint-plugin-import');
		devDep('prettier');
		devDep('husky');
		devDep('lint-staged');
		devDep('@commitlint/cli');
		devDep('@commitlint/config-conventional');
		devDep('npm-run-all');

		if (opt.tslint) {
			devDep('@typescript-eslint/eslint-plugin');
			devDep('@typescript-eslint/parser');
			devDep('eslint-config-xo-typescript');
		} else {
			devDep('eslint-config-xo');
		}

		script('lint:prettier', 'prettier "{**/*,*}.{js,ts,json,md}" -l');
		script('lint:code', 'eslint --cache .');
		script('lint', 'npm-run-all -l -p "lint:**"');
		script('pretest', 'npm run lint');
		script('commitlint', 'commitlint --from=master');

		this._writePkg(pkg);

		fs.readdirSync(getTempPath(this._name)).forEach(file => {
			let exclude = '';
			if (opt.tslint) {
				if (file === 'eslintrc.js') return;
				exclude = '.ts';
			} else if (file === 'eslintrc.ts.js') {
				return;
			}
			this._copyConfigTemp2Dest(file, exclude);
		});
	}
};
