#!/usr/bin/env node
'use strict';
const { NAME } = require('../src/const');
const { createCommand } = require('commander');
const { cliPath } = require('dependency-version-sync');
const { config } = require('../src/config');
const pkg = require('../package.json');
const ctx = require('../src/context');
const cmdYo = require('../src/cmds/yo');
const cmdAdd = require('../src/cmds/add');
const cmdInit = require('../src/cmds/init');

ctx.version = pkg.version;

if (ctx.isInit) {
	const program = createCommand(NAME);
	program
		.version(pkg.version, '-V, --Version')
		.description(pkg.description)
		.usage('<command> [options]')
		.option('--log-level <level>', 'log4js log level', 'all')
		.on('--help', () => {
			console.log('');
			console.log('Examples:');
			console.log('  $ porky --help');
			console.log('  $ porky yo --myo');
			console.log('  $ porky add <plugins...>');
			console.log('');
			console.log('Report bugs to', pkg.bugs);
			console.log('');
			console.log(`${pkg.license} © ${pkg.author}`);
		});

	program.addCommand(cmdInit(ctx));

	program.addCommand(cmdAdd(ctx));

	program.addCommand(cmdYo(ctx));

	program.addCommand(require(cliPath));

	program.addCommand(config.getCmd());

	program.parse(process.argv);
} else {
	cmdInit(ctx);
}
