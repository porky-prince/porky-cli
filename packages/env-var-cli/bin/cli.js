#!/usr/bin/env node
'use strict';
const { createCommand } = require('commander');
const which = require('which');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const Config = require('porky-config');
const nodePath = find('node');
if (!nodePath) throw new Error('node must be set to global');

const pkg = require('../package');
const cmdName = 'env-var';
const comment = `Created by ${pkg.name}, please don't edit manually.`;
const configDir = path.join(os.homedir(), '.' + pkg.name);
const config = new Config('.' + pkg.name, configDir, {
	cmdName,
});
const varConfig = new Config('.' + cmdName, configDir);

function find(cmd) {
	return which.sync(cmd, { nothrow: true });
}

function createDosFile() {
	let content = ':: ' + comment + '\n';
	content += '@ECHO OFF\n';
	createFile(content, 'cmd');
}

function createShellFile() {
	let content = '#!/bin/sh';
	content += '# ' + comment;
	// A export kewm=123
	createFile(content, 'sh');
}

function createFile(content, ext) {
	fs.writeFileSync(path.join(nodePath, config.get('cmdName') + '.' + ext), content, {
		mode: '0o755',
	});
}

const program = createCommand(pkg.name)
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.usage('<command>')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('  $ porky --help');
		console.log('  $ porky yo --myo');
		console.log('');
		console.log('Report bugs to', pkg.bugs);
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	});

program
	.command('name <name>')
	.description('name')
	.action(name => {
		config.set('cmdName', name);
		console.log(name);
	});

program
	.command('build', { isDefault: true })
	.description('build')
	.action(name => {
		console.log(name);
		createDosFile();
		createShellFile();
	});

program.addCommand(varConfig.getCmd()).parse(process.argv);
