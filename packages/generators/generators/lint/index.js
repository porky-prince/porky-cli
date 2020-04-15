const Generator = require('../../src/abstractGenerator');
const { LINT } = require('../../src/const');

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

	_fillPkgDevDepAndScript(opt, devDep, script) {
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
	}

	_copyCfgByPkg(opt, copyCfg) {
		const exclude = opt.tslint ? '.ts' : '';
		copyCfg('eslintConfig', [`eslintrc${exclude}.js`, 'eslintignore'], exclude);
		copyCfg('commitlint', ['commitlintrc.js']);
		copyCfg('husky', ['huskyrc.js']);
		copyCfg('lint-staged', ['lintstagedrc']);
		copyCfg('prettier', ['prettierrc.js', 'prettierignore']);
	}

	writing() {
		this._writingByPkg();
	}
};
