const { createCommand } = require('commander');
const { exec } = require('porky-helper').helper;

module.exports = ctx => {
	return createCommand('exec')
		.arguments('<cmds...>')
		.description('exec the command in the runtime directory')
		.allowUnknownOption()
		.on('--help', () => {
			console.log('');
			console.log('Examples:');
			console.log('  $ porky exec npm install <package>');
			console.log('  $ porky exec yarn add <package>');
			console.log('  $ porky exec npm ls --depth 0');
			console.log('  $ porky exec yarn list --depth 0');
		})
		.action(cmds => {
			exec(cmds.join(' '), {
				cwd: ctx.runtimeDir,
			});
		});
};
