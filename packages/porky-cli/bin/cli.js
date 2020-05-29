#!/usr/bin/env node
'use strict';
const { NAME, CONFIG_NAME, CMDS } = require('../src/const');
const { Command } = require('commander');
const Config = require('porky-config');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const program = new Command(NAME);
const config = new Config(CONFIG_NAME, null, {
	packageManager: 'npm',
	registry: 'https://registry.npmjs.org',
	logLevel: 'all',
});

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

program.addCommand(config.getCmd());

fs.readdirSync(CMDS).forEach(filename => {
	program.addCommand(require(path.join(CMDS, filename))(pkg));
});

program.parse(process.argv);
