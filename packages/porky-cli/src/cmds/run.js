const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');

module.exports = () => {
	const program = createCommand('run')
		.arguments('<cmd>')
		.description('run the command provided by the added plugin')
		.option('-j, --json', 'the args received from the command line are passed in JSON format');

	pluginMgr.each(plugin => {
		plugin.hasCmd() && program.addCommand(plugin.getCmd());
	});

	return program;
};
