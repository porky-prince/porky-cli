const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Generator = require('yeoman-generator');
const PKG = 'package.json';
const pm = require('../src/pm');
const TIMEOUT = 6e4;

const mockPkg = {
	dependencies: {
		'is-regex': '^1.0.5',
		'is-date-object': '^1.0.2',
	},
};

class TestGenerator extends Generator {
	writing() {
		this.fs.writeJSON(this.destinationPath(PKG), mockPkg);
	}
}

describe('pm:test', () => {
	async function operation(destPath, name, lockFile) {
		const opts = {
			dev: false,
			silent: true,
			execOpts: {
				cwd: destPath,
			},
		};
		assert.file(PKG);
		await pm(name, opts).install();
		assert.file(lockFile);
		assert.file('node_modules');
		await pm(name, opts).add(['is-symbol', 'is-string']);
		assert.fileContent(PKG, '"is-symbol":');
		assert.fileContent(PKG, '"is-string":');
		await pm(name, opts).remove(['is-regex']);
		assert.noFileContent(PKG, '"is-regex":');
		opts.dev = true;
		await pm(name, opts).add(['is-callable']);
		assert.fileContent(PKG, 'devDependencies');
		assert.fileContent(PKG, '"is-callable":');
	}

	it(
		'npm operation',
		() => {
			return helpers.run(TestGenerator).then(destPath => {
				return operation(destPath, 'npm', 'package-lock.json');
			});
		},
		TIMEOUT
	);

	it(
		'yarn operation',
		() => {
			return helpers.run(TestGenerator).then(destPath => {
				return operation(destPath, 'yarn', 'yarn.lock');
			});
		},
		TIMEOUT
	);
});
