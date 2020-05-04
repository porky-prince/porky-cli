#!/usr/bin/env node
'use strict';
const commander = require('commander');
const program = new commander.Command();
const fs = require('fs');
const path = require('path');
const { CMDS } = require('../src/const');
const pkg = require('../package.json');

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.usage('porky [options]')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('  $ porky --help');
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	});

fs.readdirSync(CMDS).forEach(filename => {
	// program.addCommand(require(path.join(CMDS, filename))());
	require(path.join(CMDS, filename))(program);
});

program.parse(process.argv);
