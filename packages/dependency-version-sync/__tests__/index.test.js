const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Generator = require('yeoman-generator');
const path = require('path');
const fs = require('fs-extra');
const { gte, valid, coerce } = require('semver');
const { getPkgDepProp } = require('porky-helper').helper;
const PKG = 'package.json';
const run = require('../src');
const TIMEOUT = 6e4;

const mockPkg = {
	dependencies: {
		'is-regex': '^1.0.5',
		'is-symbol': '1.0.3',
		'is-string': '>=1.0.0',
	},
	devDependencies: {
		'is-date-object': 'latest',
		'@porky-prince/test': 'git+https://github.com/porky-prince/test.git',
	},
	optionalDependencies: {
		'is-callable': '', // Equal to *
	},
};

class TestGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.option('packageManager', {
			type: String,
			default: 'npm',
		});
	}

	writing() {
		this.fs.writeJSON(this.destinationPath(PKG), mockPkg);
	}

	installing() {
		const opts = this.options;
		if (opts.packageManager === 'yarn') {
			this.yarnInstall();
		} else {
			this.npmInstall();
		}
	}
}

function runByOpt(opts) {
	return helpers.run(TestGenerator).withOptions(opts);
}

function assertGte(pkg, dep, pre) {
	const originVersion = valid(coerce(mockPkg[getPkgDepProp(pre)][dep])) || '0.0.0';
	expect(gte(valid(coerce(pkg[getPkgDepProp(pre)][dep])), originVersion)).toBe(true);
}

function assertEqual(pkg, dep, pre) {
	expect(pkg[getPkgDepProp(pre)][dep]).toBe(mockPkg[getPkgDepProp(pre)][dep]);
}

async function assertRun(destPath, packageManager, install) {
	await run({
		cwd: destPath,
		packageManager,
		install,
	});
	const destPKG = path.join(destPath, PKG);
	let pkg = await fs.readJson(destPKG);
	assertGte(pkg, 'is-regex');
	assertGte(pkg, 'is-symbol');
	assertGte(pkg, 'is-string');
	assertGte(pkg, 'is-date-object', 'dev');
	assertEqual(pkg, '@porky-prince/test', 'dev');
	assertGte(pkg, 'is-callable', 'optional');
	// Restore package.json
	await fs.writeJson(destPKG, mockPkg, {
		spaces: 4,
	});
	// Run again
	await run({
		cwd: destPath,
		packageManager,
		install,
		pre: '',
		filter: '^is-r\\w+',
	});
	pkg = await fs.readJson(destPKG);
	assertGte(pkg, 'is-regex');
	assertEqual(pkg, 'is-symbol');
	assertEqual(pkg, 'is-string');
	assertEqual(pkg, 'is-date-object', 'dev');
	assertEqual(pkg, '@porky-prince/test', 'dev');
	assertEqual(pkg, 'is-callable', 'optional');
}

describe(require('../' + PKG).description, () => {
	it(
		'run on the project after npm install',
		() => {
			return runByOpt({
				skipInstall: false,
			}).then(destPath => {
				assert.file(PKG);
				assert.file('package-lock.json');
				assert.file('node_modules');
				return assertRun(destPath);
			});
		},
		TIMEOUT
	);

	it(
		'run on the project after yarn install',
		() => {
			return runByOpt({
				skipInstall: false,
				packageManager: 'yarn',
			}).then(destPath => {
				assert.file(PKG);
				assert.file('yarn.lock');
				assert.file('node_modules');
				return assertRun(destPath, 'yarn');
			});
		},
		TIMEOUT
	);

	it(
		"run on the project has't install",
		() => {
			return runByOpt({
				skipInstall: true,
				packageManager: 'yarn',
			}).then(async destPath => {
				assert.file(PKG);
				assert.noFile('yarn.lock');
				assert.noFile('node_modules');
				await assertRun(destPath, 'yarn', true);
				assert.file('yarn.lock');
				assert.file('node_modules');
			});
		},
		TIMEOUT
	);
});
