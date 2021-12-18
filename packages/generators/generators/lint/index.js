const AbstractGenerator = require('../../src/abstractGenerator');
const { DepModule, depConfig } = require('../../src/depModule');
const { LINT } = require('../../src/const');
const configs = depConfig({
	tslint: {
		type: Boolean,
		desc: 'Using eslint in typescript project',
	},
});

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, LINT);
	}

	_fillPkg(opts, pkg, devDep, script) {
		devDep(
			new DepModule('eslint', '^7.4.0'),
			new DepModule('eslint-config-prettier', '^6.11.0'),
			new DepModule('eslint-plugin-prettier', '^3.1.4'),
			new DepModule('eslint-plugin-import', '^2.22.0'),
			new DepModule('eslint-config-xo', '^0.32.0')
		);

		opts.tslint &&
			devDep(
				new DepModule('eslint-config-xo-typescript', '^0.31.0'),
				new DepModule('@typescript-eslint/eslint-plugin', '^3.6.0'),
				new DepModule('@typescript-eslint/parser', '^3.6.0')
			);

		devDep(
			new DepModule('prettier', '^2.0.5'),
			new DepModule('husky', '^4.2.5'),
			new DepModule('lint-staged', '^10.2.11'),
			new DepModule('@commitlint/cli', '^9.0.1'),
			new DepModule('@commitlint/config-conventional', '^9.0.1'),
			new DepModule('npm-run-all', '^4.1.5')
		);

		script('lint:prettier', 'prettier "{**/*,*}.{js,ts,json,md}" -l');
		script('lint:code', 'eslint --cache "{**/*,*}.{js,ts}"');
		script('lint', 'npm-run-all -l -p "lint:**"');
		script('pretest', 'npm run lint');
		script('commitlint', 'commitlint --from=master');
	}

	_copyTempByPkg(opts, pkg, copyTemp) {
		const exclude = opts.tslint ? '.ts' : '';
		copyTemp('eslintConfig', [`eslintrc${exclude}.js`, 'eslintignore'], exclude);
		copyTemp('commitlint', ['commitlintrc.js']);
		copyTemp('husky', ['huskyrc.js']);
		copyTemp('lint-staged', ['lintstagedrc']);
		copyTemp('prettier', ['prettierrc.js', 'prettierignore']);
	}

	writing() {
		return this._writingByPkg();
	}
};

module.exports.configs = configs;
