#!/usr/bin/env node
'use strict';
const { Command } = require('commander');
const program = new Command('dvs');
const pkg = require('../package.json');
const { helper, checker } = require('porky-helper');
const run = require('../src');

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.usage('[options]')
	.option('-c, --cwd <path>', 'used as current working directory for `exec` in npm listing')
	.option('-m, --packageManager <name>', 'npm or yarn', checker.checkPkgMgr, 'npm')
	.option(
		'-p, --pre <pre>',
		'select a package.json dependencies prop, option:' +
			helper.pkgDepPropPreStr +
			', default all dependencies props',
		checker.checkPkgDepPropPre
	)
	.option('-f, --filter <package>', 'RegExp or String, filter specified packages')
	.option('-i, --install', 'whether to execute `npm install` for synchronization')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('  $ dvs --help');
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	})
	.action(run);

process.argv[1] === __filename && program.parse(process.argv);

module.exports = program;
