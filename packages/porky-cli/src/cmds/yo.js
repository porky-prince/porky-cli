const { PKG } = require('../const');
const fs = require('fs-extra');
const _ = require('lodash');
const { BASE } = require('../const');
const { exec, yoCliFile, runYO } = require('../helper');
const { app } = require('@porky-prince/generator-generators');

function runLink(pkgMgr) {
	return exec('yo --version')
		.then(stdout => {
			console.warn(`yo(${_.trim(stdout)}) is already exists globally`);
		})
		.catch(async () => {
			const pkg = await fs.readJson(PKG);
			['yo', 'yo-complete'].forEach(cliName => {
				pkg.bin[cliName] = yoCliFile(cliName);
			});
			await fs.writeJson(PKG, pkg, {
				spaces: 4,
			});
			await exec(pkgMgr + ' link', { cwd: BASE });
		});
}

function filterPkgMgr(str) {
	if (str !== 'yarn') {
		str = 'npm';
	}

	return str;
}

module.exports = program => {
	const description = 'CLI tool for running Yeoman generators http://yeoman.io';
	program
		.command('yo')
		.usage('[options]')
		.description(description)
		.allowUnknownOption()
		.option('--yoh', 'the yo help')
		.option('--yov', 'the yo version')
		.option('--myo', 'some custom generators')
		.option(
			'--link <PkgMgr>',
			'add yo to global, like `npm link yo`, options [yarn | npm]',
			filterPkgMgr
		)
		.action(options => {
			if (options.yoh) {
				runYO('--help');
			} else if (options.yov) {
				runYO('--version');
			} else if (options.myo) {
				runYO(app);
			} else if (options.link) {
				runLink(options.link);
			} else {
				runYO.apply(null, options.args);
			}
		});
};
