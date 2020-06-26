const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Generator = require('../app/index');

describe(`test:runtime`, () => {
	const filename = 'package.json';
	it(`create ${filename}`, () => {
		return helpers.run(Generator).then(() => assert.file(filename));
	});

	it('respect --generate-into option', () => {
		return helpers
			.run(Generator)
			.withOptions({ generateInto: 'other/' })
			.then(() => assert.file('other/' + filename));
	});
});
