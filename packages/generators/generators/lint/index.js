const { exec } = require('child_process');
const _ = require('lodash');
const Generator = require('../../src/abstractGenerator');
const { LINT } = require('../../src/const');

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

	async _fillPkg(opt, pkg) {
		const done = this.async();
		const arr = [];
		const devDependencies = pkg.devDependencies || {};
		const scripts = pkg.scripts || {};
		const devDep = module => {
			arr.push(
				new Promise((resolve, reject) => {
					exec(`npm view ${module} version`, (error, stdout) => {
						if (error) {
							console.error(error);
							reject(error);
						} else {
							devDependencies[module] =
								devDependencies[module] || `^${_.trim(stdout)}`;
							resolve(stdout);
						}
					});
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
		const copyCfg = (config, files, exclude) => {
			!pkg[config] &&
				files.forEach(file => {
					this._copyConfigTemp2Dest(file, exclude);
				});
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
