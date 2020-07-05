#!/usr/bin/env node
'use strict';
const { createCommand } = require('commander');
const which = require('which');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const Config = require('porky-config');
let nodePath = find('node');
if (!nodePath) throw new Error('node must be set to global');
nodePath = path.parse(nodePath).dir;

const pkg = require('../package');
const cmdName = 'env-var';
const comment = `Created by ${pkg.name}, please don't edit manually.`;
const configDir = path.join(os.homedir(), '.' + pkg.name);
const config = new Config('.' + pkg.name, configDir, {
	cmdName,
});
const varConfig = new Config('.' + cmdName, configDir).on('save', build);

function find(cmd) {
	return which.sync(cmd, { nothrow: true });
}

function createFile(content, ext) {
	fs.writeFileSync(path.join(nodePath, config.get('cmdName') + ext), content, {
		mode: 0o755,
	});
}

function build() {
	let dos = `:: ${comment}\n@ECHO OFF\n`;
	let shell = `#!/bin/sh\n# ${comment}\n`;
	varConfig.each((value, key) => {
		dos += `set ${key}=${value}\n`;
		shell += `export ${key}="${value}"\n`;
	});
	createFile(dos, '.cmd');
	createFile(shell, '');
}

const program = createCommand(pkg.name)
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.usage('[command]')
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log(`  $ ${pkg.name} build # default`);
		console.log(`  $ ${pkg.name} name custom-name`);
		console.log(`${pkg.description}:`);
		console.log('  dos:');
		console.log('    $ env-var');
		console.log('  shell:');
		console.log('    $ . env-var');
		console.log('    $ source env-var');
		console.log('');
		console.log('Report bugs to', pkg.bugs);
		console.log('');
		console.log(`${pkg.license} © ${pkg.author}`);
	});

program
	.command('name [name]')
	.description('get or set declaration command name')
	.action(name => {
		const oldName = config.get('cmdName');
		if (name) {
			if (oldName !== name && !find(name)) {
				let oldPath = path.join(nodePath, oldName);
				fs.existsSync(oldPath) && fs.removeSync(oldPath);
				oldPath += '.cmd';
				fs.existsSync(oldPath) && fs.removeSync(oldPath);
				config.set('cmdName', name);
				build();
			} else {
				console.log(`warn: The '${name}' is already exists!`);
			}
		} else {
			console.log(oldName);
		}
	});

program
	.command('build', { isDefault: true })
	.description('build the temporary of environment variable by .' + cmdName + '.json')
	.action(build);

program.addCommand(varConfig.getCmd()).parse(process.argv);
