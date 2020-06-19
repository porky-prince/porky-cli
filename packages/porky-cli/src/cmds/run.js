const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');

module.exports = ctx => {
	const program = createCommand('run')
		.arguments('<cmd>')
		.description('run the command provided by the added plugin')
		.option(
			'-j, --json <cmd-to-json>',
			'the args received from the command line are passed in JSON format,\n' +
				'for more: https://github.com/vkolencik/cmd-to-json'
		)
		.on('option:json', () => {
			ctx.json = program.json;
		})
		.on('--help', () => {
			console.log('');
			console.log('Examples:');
			console.log('  $ porky run <cmd> [args...]');
			console.log('  $ porky run <cmd> [args...] -j cwd=...');
			console.log('  $ porky run <cmd> [args...] -j "src=... dest=... opts.encoding=utf8"');
			console.log(
				'  $ porky run <cmd> [args...] -j "src:string=... dest:string=... opts.count:number=1"'
			);
			console.log('Notices:');
			console.log(' × $ porky run <cmd> [args...] -j cwd = ...');
			console.log(' × $ porky run <cmd> [args...] -j src=... dest=... opts.encoding=utf8');
			console.log(" × $ porky run <cmd> [args...] -j 'src=... dest=... opts.encoding=utf8'");
		});

	pluginMgr.each(plugin => {
		plugin.hasCmd() && program.addCommand(plugin.getCmd());
	});

	return program;
};
