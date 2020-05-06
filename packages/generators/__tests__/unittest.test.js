const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { TIMEOUT, PKG, UNIT_TEST } = require('../src/const');
const { getGenerator, getTestFilename } = require('../src/helper');
const Generator = getGenerator(UNIT_TEST);

async function runByOpt(opt = {}) {
	return helpers.run(Generator).withOptions(opt);
}

describe(`test:${UNIT_TEST}`, () => {
	describe(`test:${UNIT_TEST} --unitTestModule jest`, () => {
		it(
			'create default files',
			() => {
				return runByOpt().then(() => {
					assert.fileContent(PKG, '"jest":');
					assert.fileContent(PKG, '"test": "jest"');
					assert.file(getTestFilename('jest'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule jest --scriptType ts`, () => {
		it(
			'create files in ts project',
			() => {
				return runByOpt({
					scriptType: 'ts',
				}).then(() => {
					assert.fileContent(PKG, '"jest":');
					assert.fileContent(PKG, '"ts-jest":');
					assert.fileContent(PKG, '"@types/jest":');
					assert.fileContent(
						PKG,
						'"test": "jest --transform={\\\\\\"^.+\\\\\\\\.tsx?$\\\\\\":\\\\\\"ts-jest\\\\\\"}"'
					);
					assert.file(getTestFilename('jest', 'ts'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule jest --scriptType es`, () => {
		it(
			'create files in es project',
			() => {
				return runByOpt({
					scriptType: 'es',
				}).then(() => {
					assert.fileContent(PKG, '"jest":');
					assert.fileContent(PKG, '"babel-jest":');
					assert.fileContent(
						PKG,
						'"test": "jest --transform={\\\\\\"^.+\\\\\\\\.jsx?$\\\\\\":\\\\\\"babel-jest\\\\\\"}"'
					);
					assert.file(getTestFilename('jest'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule mocha`, () => {
		it(
			'create default files',
			() => {
				return runByOpt({
					unitTestModule: 'mocha',
				}).then(() => {
					assert.fileContent(PKG, '"mocha":');
					assert.fileContent(PKG, '"chai":');
					assert.fileContent(PKG, '"test": "mocha"');
					assert.file(getTestFilename('mocha'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule mocha --scriptType ts`, () => {
		it(
			'create files in ts project',
			() => {
				return runByOpt({
					unitTestModule: 'mocha',
					scriptType: 'ts',
				}).then(() => {
					assert.fileContent(PKG, '"mocha":');
					assert.fileContent(PKG, '"chai":');
					assert.fileContent(PKG, '"ts-node":');
					assert.fileContent(PKG, '"@types/mocha":');
					assert.fileContent(PKG, '"@types/chai":');
					assert.fileContent(
						PKG,
						'"test": "mocha --require ts-node/register \\"**/*.@(test|spec).ts?(x)\\""'
					);
					assert.file(getTestFilename('mocha', 'ts'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule mocha --scriptType es`, () => {
		it(
			'create files in es project',
			() => {
				return runByOpt({
					unitTestModule: 'mocha',
					scriptType: 'es',
				}).then(() => {
					assert.fileContent(PKG, '"mocha":');
					assert.fileContent(PKG, '"chai":');
					assert.fileContent(PKG, '"@babel/register":');
					assert.fileContent(
						PKG,
						'"test": "mocha --require @babel/register \\"**/*.@(test|spec).js?(x)\\""'
					);
					assert.file(getTestFilename('mocha'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule jasmine`, () => {
		it(
			'create default files',
			() => {
				return runByOpt({
					unitTestModule: 'jasmine',
				}).then(() => {
					assert.fileContent(PKG, '"jasmine":');
					assert.fileContent(
						PKG,
						'"test": "jasmine \\"**!(node_modules)/*.@(test|spec).js?(x)\\""'
					);
					assert.file(getTestFilename('jasmine'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule jasmine --scriptType ts`, () => {
		it(
			'create files in ts project',
			() => {
				return runByOpt({
					unitTestModule: 'jasmine',
					scriptType: 'ts',
				}).then(() => {
					assert.fileContent(PKG, '"jasmine":');
					assert.fileContent(PKG, '"ts-node":');
					assert.fileContent(PKG, '"@types/jasmine":');
					assert.fileContent(
						PKG,
						'"test": "jasmine --require=ts-node/register \\"**!(node_modules)/*.@(test|spec).ts?(x)\\""'
					);
					assert.file(getTestFilename('jasmine', 'ts'));
				});
			},
			TIMEOUT
		);
	});

	describe(`test:${UNIT_TEST} --unitTestModule jasmine --scriptType es`, () => {
		it(
			'create files in es project',
			() => {
				return runByOpt({
					unitTestModule: 'jasmine',
					scriptType: 'es',
				}).then(() => {
					assert.fileContent(PKG, '"jasmine":');
					assert.fileContent(PKG, '"@babel/register":');
					assert.fileContent(
						PKG,
						'"test": "jasmine --require=@babel/register \\"**!(node_modules)/*.@(test|spec).js?(x)\\""'
					);
					assert.file(getTestFilename('jasmine'));
				});
			},
			TIMEOUT
		);
	});
});
