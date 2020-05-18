#!/usr/bin/env node
'use strict';
const { Command } = require('commander');
const program = new Command('porky');
const fs = require('fs');
const path = require('path');
const { CMDS } = require('../src/const');
const pkg = require('../package.json');

program
	.version(pkg.version, '-V, --Version')
	.description(pkg.description)
	.usage('[options]')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('  $ porky --help');
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	});

fs.readdirSync(CMDS).forEach(filename => {
	program.addCommand(require(path.join(CMDS, filename))(pkg));
});

program.parse(process.argv);
