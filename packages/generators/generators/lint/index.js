const AbstractGenerator = require('../../src/abstractGenerator');
const { LINT } = require('../../src/const');
const configs = {
	eslint: {
		type: Boolean,
		default: true,
		desc: 'Using eslint in javascript project',
	},
	tslint: {
		type: Boolean,
		desc: 'Using eslint in typescript project',
	},
};

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, LINT);
	}

	_fillPkg(opts, pkg, devDep, script) {
		devDep(
			'eslint',
			'eslint-config-prettier',
			'eslint-plugin-prettier',
			'eslint-plugin-import',
			'prettier',
			'husky',
			'lint-staged',
			'@commitlint/cli',
			'@commitlint/config-conventional',
			'npm-run-all'
		);

		if (opts.tslint) {
			devDep(
				'@typescript-eslint/eslint-plugin',
				'@typescript-eslint/parser',
				'eslint-config-xo-typescript'
			);
		} else {
			devDep('eslint-config-xo');
		}

		script('lint:prettier', 'prettier "{**/*,*}.{js,ts,json,md}" -l');
		script('lint:code', 'eslint --cache .');
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

module.exports.path = __dirname;
module.exports.configs = configs;
