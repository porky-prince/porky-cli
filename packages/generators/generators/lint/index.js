const Generator = require('../../src/abstractGenerator');
const { LINT } = require('../../src/const');
const { getLatestVersion } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
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

		await Promise.all(arr);
		pkg.devDependencies = devDependencies;
		pkg.scripts = scripts;
		this._writePkg(pkg);
		done();
	}

	writing() {
		const opt = this.options;
		const pkg = this._readPkg();
		const copyCfg = (config, tempNames, exclude) => {
			!pkg[config] && this._copyConfigTemps2Dest(tempNames, exclude);
		};

		this._fillPkg(opt, pkg);

		let exclude = opt.tslint ? '.ts' : '';
		copyCfg('eslintConfig', [`eslintrc${exclude}.js`, 'eslintignore'], exclude);
		copyCfg('commitlint', ['commitlintrc.js']);
		copyCfg('husky', ['huskyrc.js']);
		copyCfg('lint-staged', ['lintstagedrc']);
		copyCfg('prettier', ['prettierrc.js', 'prettierignore']);
	}
};
