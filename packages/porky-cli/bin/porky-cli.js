#!/usr/bin/env node
'use strict';
const program = require('commander');
const pkg = require('../package.json');
const pkgSafeName = require('./');

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.usage('<command> [options]')
	.requiredOption('-i, --input <path>', 'the input path')
	.option('-o, --output <path>', 'the output path')
	.option('-f, --flag <boolean>', 'boolean options', false)
	.option('-n, --number <number>', 'number options', isNumber('-n'), 0)
	.option('-c, --choice <choice>', 'choose options (A | B | C | D)', 'A')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log(`  $ ${pkg.name} --help`);
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	})
	.action(options => {
		pkgSafeName(options.input);
	});

program.parse(process.argv);

function isNumber(str) {
	return function(value) {
		value = Number(value);
		if (isNaN(value)) {
			throw `error: options "${str}" must be a number`;
		}
		return value;
	};
}
