const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { PKG, APP, APP_ENTRY, TS_CONFIG, BABEL_JS } = require('../src/const');
const { getGenerator, getConfigName } = require('../src/helper');
const Generator = getGenerator(APP);
const timeout = 1e4;

describe(`test:${APP}`, () => {
	let ext = '.js';

	it('create default files', () => {
		return helpers.run(Generator).then(() => assert.file(APP_ENTRY + ext));
	});

	describe(`test:${APP} --scriptType`, () => {
		it(
			'create files in es project',
			() => {
				return helpers
					.run(Generator)
					.withOptions({
						scriptType: 'es',
					})
					.then(() => {
						assert.file(APP_ENTRY + ext);
						assert.file(getConfigName(BABEL_JS));
						assert.fileContent(PKG, '"@babel/core":');
						assert.fileContent(PKG, '"build": "babel src -d dist --copy-files"');
					});
			},
			timeout
		);

		it(
			'create files in ts project',
			() => {
				ext = '.ts';
				return helpers
					.run(Generator)
					.withOptions({
						scriptType: 'ts',
					})
					.then(() => {
						assert.file(APP_ENTRY + ext);
						assert.file(TS_CONFIG);
						assert.fileContent(PKG, '"typescript":');
						assert.fileContent(PKG, '"build": "tsc -p . --outDir dist"');
					});
			},
			timeout
		);
	});
});
