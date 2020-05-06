const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { PKG, CLI, CLI_JS } = require('../src/const');
const { getGenerator } = require('../src/helper');
const Generator = getGenerator(CLI);
const timeout = 1e4;

describe(`test:${CLI}`, () => {
	it(
		`creates ${CLI_JS}`,
		() => {
			return helpers
				.run(Generator)
				.withOptions({ cliName: 'porky' })
				.then(() => {
					assert.file(CLI_JS);
					assert.fileContent(PKG, `"porky": "${CLI_JS}"`);
					assert.fileContent(PKG, '"commander":');
				});
		},
		timeout
	);

	it(
		'respect --generate-into option',
		() => {
			const OTHER = 'other/';
			return helpers
				.run(Generator)
				.withOptions({ cliName: 'porky', generateInto: OTHER })
				.then(() => {
					assert.file(OTHER + CLI_JS);
					assert.fileContent(OTHER + PKG, `"porky": "${CLI_JS}"`);
					assert.fileContent(OTHER + PKG, '"commander":');
				});
		},
		timeout
	);
});
