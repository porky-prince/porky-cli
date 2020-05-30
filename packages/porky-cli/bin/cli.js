#!/usr/bin/env node
'use strict';
const { NAME, CMDS } = require('../src/const');
const { createCommand } = require('commander');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const ctx = require('../src/context');
const program = createCommand(NAME);

ctx.version = pkg.version;

program
	.version(pkg.version, '-V, --Version')
	.description(pkg.description)
	.usage('[options]')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('  $ porky --help');
		console.log('');
		console.log('Report bugs to', pkg.bugs);
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	});

program.addCommand(ctx.config.getCmd());

fs.readdirSync(CMDS).forEach(filename => {
	program.addCommand(require(path.join(CMDS, filename))(pkg));
});

program.parse(process.argv);
