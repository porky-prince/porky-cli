const { PKG } = require('../const');
const fs = require('fs-extra');
const _ = require('lodash');
const { createCommand } = require('commander');
const program = createCommand('yo');
const { BASE } = require('../const');
const { yoCliFile, runYo } = require('../helper');
const { app } = require('@porky-prince/generator-generators');
const { helper } = require('porky-helper');

function runLink(packageManager) {
	return helper
		.exec('yo --version')
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
			await helper.exec(packageManager + ' link', { cwd: BASE });
		});
}

module.exports = ctx => {
	return program
		.usage('[options]')
		.description('CLI tool for running Yeoman generators http://yeoman.io')
		.allowUnknownOption()
		.option('--yoh', 'the yo help')
		.option('--yov', 'the yo version')
		.option('--myo', 'some custom generators')
		.option('--link', 'add yo to global, like `npm link yo`')
		.action(opts => {
			if (opts.yoh) {
				runYo('--help');
			} else if (opts.yov) {
				runYo('--version');
			} else if (opts.myo) {
				runYo(app);
			} else if (opts.link) {
				runLink(ctx.packageManager);
			} else {
				runYo.apply(null, opts.args);
			}
		});
};
