#!/usr/bin/env node
'use strict';
const { NAME } = require('../src/const');
const { createCommand } = require('commander');
const { cliPath } = require('dependency-version-sync');
const pkg = require('../package.json');
const ctx = require('../src/context');
const cmdYo = require('../src/cmds/yo');
const cmdAdd = require('../src/cmds/add');
const program = createCommand(NAME);

ctx.version = pkg.version;

program
	.version(pkg.version, '-V, --Version')
	.description(pkg.description)
	.usage('<command> [options]')
	.option('--log-level', 'log level')
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

program.addCommand(cmdYo(ctx));

program.addCommand(cmdAdd(ctx));

program.addCommand(ctx.config.getCmd());

program.addCommand(require(cliPath));

program.parse(process.argv);
