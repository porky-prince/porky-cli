const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');
const { chalk, myLogger } = require('porky-helper').logger;

module.exports = async () => {
	return createCommand('list')
		.arguments('[options]')
		.description('list the available plugins')
		.option('-a, --all', 'list the all plugins')
		.option('-d, --detail', 'show the plugin details')
		.action(opts => {
			pluginMgr.each(plugin => {
				if (opts.all || !plugin.hasError()) {
					let log = chalk.green(plugin.cmdName) + '  ' + plugin.name;
					if (opts.detail) {
						// TODO
						log += '\n';
					}

					myLogger.log(log);
				}
			});
		});
};
