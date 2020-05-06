const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { TIMEOUT, PKG, APP } = require('../src/const');
const { getGenerator } = require('../src/helper');
const Generator = getGenerator(APP);

async function runByAnswers(answers, fn) {
	return helpers
		.run(Generator)
		.withPrompts(answers)
		.on('ready', gen => {
			fn && fn(gen);
		});
}

describe('test:app', () => {
	describe('running on new project', () => {
		it(
			'scaffold a default project',
			() => {
				const answers = {
					name: 'demo',
					cliName: 'demoCli',
				};
				return runByAnswers(answers).then(() => {
					assert.file([
						PKG,
						'bin/cli.js',
						'.editorconfig',
						'.git',
						'.gitignore',
						'.gitattributes',
						'.eslintrc.js',
						'.eslintignore',
						'.commitlintrc.js',
						'.huskyrc.js',
						'.lintstagedrc',
						'.prettierrc.js',
						'.prettierignore',
						'src/main.js',
						'README.md',
						'test/jest.test.js',
						'LICENSE',
					]);

					assert.jsonFileContent(PKG, {
						name: 'demo',
						version: '1.0.0',
						description: '',
						keywords: [''],
						author: '',
						license: 'MIT',
						bin: {
							demoCli: 'bin/cli.js',
						},
					});
				});
			},
			TIMEOUT
		);

		it(
			'scaffold a full project',
			() => {
				const answers = {
					name: 'demo',
					version: '1.1.1',
					description: 'This is a demo',
					keywords: 'yo yeoman',
					author: 'Porky Kay',
					license: 'MIT',
					// ----
					cli: true,
					cliName: 'demoCli',
					// ----
					editorconfig: true,
					// ----
					git: true,
					repoName: 'demo',
					gitAccount: 'porky-prince',
					// ----
					lint: true,
					eslint: true,
					tslint: true,
					// ----
					main: true,
					scriptType: 'ts',
					// ----
					readme: true,
					content: '',
					inNodejs: true,
					inBrowser: true,
					inCmd: true,
					// ----
					unittest: true,
					unitTestModule: 'jest',
					// ----
					email: 'ke_weiming@sina.com',
					website: 'https://www.demo.com',
				};
				return runByAnswers(answers).then(() => {
					assert.file([
						PKG,
						'bin/cli.js',
						'.editorconfig',
						'.git',
						'.gitignore',
						'.gitattributes',
						'.eslintrc.js',
						'.eslintignore',
						'.commitlintrc.js',
						'.huskyrc.js',
						'.lintstagedrc',
						'.prettierrc.js',
						'.prettierignore',
						'src/main.ts',
						'tsconfig.json',
						'README.md',
						'test/jest.test.ts',
						'LICENSE',
					]);

					assert.jsonFileContent(PKG, {
						name: 'demo',
						version: '1.1.1',
						description: 'This is a demo',
						keywords: ['yo', 'yeoman'],
						author: 'Porky Kay',
						license: 'MIT',
						bin: {
							demoCli: 'bin/cli.js',
						},
						repository: 'https://github.com/porky-prince/demo.git',
						homepage: 'https://github.com/porky-prince/demo#readme',
						bugs: 'https://github.com/porky-prince/demo/issues',
					});
				});
			},
			TIMEOUT
		);
	});

	describe('running on existing project', () => {
		it(
			'Keeps current package.json fields',
			() => {
				const pkg = {
					name: 'demo',
					version: '1.1.1',
					description: 'This is a demo',
					keywords: ['yo', 'yeoman'],
					author: 'Porky Kay',
					license: 'MIT',
					bin: {
						demoCli: 'bin/cli.js',
					},
					repository: 'https://github.com/porky-prince/demo.git',
					homepage: 'https://github.com/porky-prince/demo#readme',
					bugs: 'https://github.com/porky-prince/demo/issues',
				};
				return runByAnswers({ name: 'generator-demo', cliName: 'generatorDemo' }, gen => {
					gen.fs.writeJSON(gen.destinationPath(PKG), pkg);
				}).then(() => {
					assert.jsonFileContent(PKG, pkg);
				});
			},
			TIMEOUT
		);
	});

	describe('--no-editorconfig', () => {
		it(
			'include the raw files',
			() => {
				const answers = {
					name: 'demo',
					cliName: 'demoCli',
					editorconfig: false,
				};
				return runByAnswers(answers).then(() => assert.noFile('.editorconfig'));
			},
			TIMEOUT
		);
	});
});
