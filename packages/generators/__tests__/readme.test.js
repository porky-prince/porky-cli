const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { README, PKG } = require('../src/const');
const { getGenerator, getMarkdownName } = require('../src/helper');
const filename = getMarkdownName(README);
const Generator = getGenerator(README);
const name = 'test-project';
const safeName = 'testProject';
const description = 'This is a test.';
const author = 'Porky Ke';
const license = 'MIT';

async function runByOpt(opt) {
	const generateInto = opt.generateInto || '';
	return helpers
		.run(Generator)
		.withOptions(opt)
		.on('ready', gen => {
			gen.fs.writeJSON(gen.destinationPath(generateInto + PKG), {
				name,
				description,
				author,
				license,
			});
		});
}

describe(`test:${README}`, () => {
	beforeEach(() => {
		return runByOpt({});
	});

	it('create default contents', () => {
		assert.file(filename);
		assert.fileContent(filename, description);
		assert.fileContent(filename, `$ npm install --save ${name}`);
		assert.fileContent(filename, `const ${safeName} = require('${name}');`);
		assert.noFileContent(filename, `<script src="${safeName}.js"></script>`);
		assert.noFileContent(filename, `${safeName} [options]`);
		assert.fileContent(filename, `[${license} © ${author}](./LICENSE)`);
	});
});

describe(`test:${README} --content --description`, () => {
	const description = 'This is custom description.';
	const content = 'My custom content';

	beforeEach(() => {
		return runByOpt({
			description,
			content,
		});
	});

	it('fill custom contents', () => {
		assert.file(filename);
		assert.fileContent(filename, description);
		assert.fileContent(filename, content);
		assert.noFileContent(filename, `$ npm install --save ${name}`);
		assert.noFileContent(filename, `const ${safeName} = require('${name}');`);
		assert.noFileContent(filename, `<script src="${safeName}.js"></script>`);
		assert.noFileContent(filename, `${safeName} [options]`);
		assert.fileContent(filename, `[${license} © ${author}](./LICENSE)`);
	});
});

describe(`test:${README} --generate-into`, () => {
	const generateInto = 'other/';
	const filename = generateInto + getMarkdownName(README);
	beforeEach(() => {
		return runByOpt({
			generateInto,
		});
	});

	it(`create default contents in ${filename}`, () => {
		assert.file(filename);
		assert.fileContent(filename, description);
		assert.fileContent(filename, `$ npm install --save ${name}`);
		assert.fileContent(filename, `const ${safeName} = require('${name}');`);
		assert.noFileContent(filename, `<script src="${safeName}.js"></script>`);
		assert.noFileContent(filename, `${safeName} [options]`);
		assert.fileContent(filename, `[${license} © ${author}](./LICENSE)`);
	});
});

describe(`test:${README} --inNodejs --inBrowser`, () => {
	beforeEach(() => {
		return runByOpt({
			inNodejs: true,
			inBrowser: true,
		});
	});

	it('fill nodejs and browser contents', () => {
		assert.file(filename);
		assert.fileContent(filename, description);
		assert.fileContent(filename, `$ npm install --save ${name}`);
		assert.fileContent(filename, `const ${safeName} = require('${name}');`);
		assert.fileContent(filename, `<script src="${safeName}.js"></script>`);
		assert.noFileContent(filename, `${safeName} [options]`);
		assert.fileContent(filename, `[${license} © ${author}](./LICENSE)`);
	});
});

describe(`test:${README} --inNodejs --inCmd`, () => {
	beforeEach(() => {
		return runByOpt({
			inNodejs: true,
			inCmd: true,
		});
	});

	it('fill nodejs and command line contents', () => {
		assert.file(filename);
		assert.fileContent(filename, description);
		assert.fileContent(filename, `$ npm install --save ${name}`);
		assert.fileContent(filename, `const ${safeName} = require('${name}');`);
		assert.noFileContent(filename, `<script src="${safeName}.js"></script>`);
		assert.fileContent(filename, `${safeName} [options]`);
		assert.fileContent(filename, `[${license} © ${author}](./LICENSE)`);
	});
});
