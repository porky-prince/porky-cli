const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { TIMEOUT, PKG, LINT } = require('../src/const');
const { getGenerator } = require('../src/helper');
const Generator = getGenerator(LINT);

async function runByOpt(opt = {}, fn = null) {
	return helpers
		.run(Generator)
		.withOptions(opt)
		.on('ready', gen => {
			fn && fn(gen);
		});
}

describe(`test:${LINT}`, () => {
	describe('test:eslint', () => {
		beforeEach(() => {
			return runByOpt();
		}, TIMEOUT);

		it('create default files when there is no package.json or package.json is initialized', () => {
			assert.fileContent(PKG, '"@commitlint/cli":');
			assert.fileContent(PKG, '"eslint-config-xo":');
			assert.noFileContent(PKG, '"eslint-config-xo-typescript":');
			assert.fileContent(PKG, '"lint:code": "eslint --cache \\"{**/*,*}.{js,ts}\\""');
			assert.file('.lintstagedrc');
			assert.noFile('.eslintrc.ts.js');
			assert.file('.eslintrc.js');
			assert.fileContent('.eslintrc.js', 'xo');
			assert.noFileContent('.eslintrc.js', '@typescript-eslint/parser');
		});
	});

	describe('test:lint', () => {
		beforeEach(() => {
			return runByOpt({}, gen => {
				gen.fs.writeJSON(gen.destinationPath(PKG), {
					scripts: {
						'lint:code': 'echo test',
					},
					devDependencies: {
						'@commitlint/cli': '0.0.0',
					},
					eslintConfig: {
						extends: ['custom'],
					},
				});
			});
		}, TIMEOUT);

		it('create default files when package.json already exists', () => {
			assert.fileContent(PKG, '"@commitlint/cli": "0.0.0"');
			assert.fileContent(PKG, '"eslint-config-xo":');
			assert.noFileContent(PKG, '"eslint-config-xo-typescript":');
			assert.fileContent(PKG, '"lint:code": "echo test"');
			assert.fileContent(PKG, 'eslintConfig');
			assert.noFile('.eslintignore');
			assert.noFile('.eslintrc.ts.js');
			assert.noFile('.eslintrc.js');
			assert.file('.lintstagedrc');
		});
	});

	describe('test:lint --generate-into', () => {
		const generateInto = 'other/';
		beforeEach(() => {
			return runByOpt({
				generateInto,
			});
		}, TIMEOUT);

		it('create default files in directory "other/"', () => {
			assert.fileContent(generateInto + PKG, '"@commitlint/cli":');
			assert.fileContent(generateInto + PKG, '"eslint-config-xo":');
			assert.noFileContent(generateInto + PKG, '"eslint-config-xo-typescript":');
			assert.fileContent(
				generateInto + PKG,
				'"lint:code": "eslint --cache \\"{**/*,*}.{js,ts}\\""'
			);
			assert.file(generateInto + '.lintstagedrc');
			assert.noFile(generateInto + '.eslintrc.ts.js');
			assert.file(generateInto + '.eslintrc.js');
			assert.fileContent(generateInto + '.eslintrc.js', 'xo');
			assert.noFileContent(generateInto + '.eslintrc.js', '@typescript-eslint/parser');
		});
	});

	describe('test:lint --tslint', () => {
		beforeEach(() => {
			return runByOpt({
				tslint: true,
			});
		}, TIMEOUT);

		it('create default files in ts project', () => {
			assert.fileContent(PKG, '"@commitlint/cli":');
			assert.fileContent(PKG, '"eslint-config-xo":');
			assert.fileContent(PKG, '"eslint-config-xo-typescript":');
			assert.fileContent(PKG, '"lint:code": "eslint --cache \\"{**/*,*}.{js,ts}\\""');
			assert.file('.lintstagedrc');
			assert.noFile('.eslintrc.ts.js');
			assert.file('.eslintrc.js');
			assert.fileContent('.eslintrc.js', 'xo');
			assert.fileContent('.eslintrc.js', '@typescript-eslint/parser');
		});
	});
});
