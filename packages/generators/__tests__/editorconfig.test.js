const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { EDITOR_CONFIG } = require('../src/const');
const { getGenerator, getConfigName } = require('../src/helper');

describe(`test:${EDITOR_CONFIG}`, () => {
	const filename = getConfigName(EDITOR_CONFIG);
	const Generator = getGenerator(EDITOR_CONFIG);

	it(`creates ${filename}`, () => {
		return helpers.run(Generator).then(() => assert.file(filename));
	});

	it('respect --generate-into option', () => {
		return helpers
			.run(Generator)
			.withOptions({ generateInto: 'other/' })
			.then(() => assert.file('other/' + filename));
	});
});
