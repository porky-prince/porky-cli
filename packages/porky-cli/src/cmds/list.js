const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');
const { chalk, myLogger } = require('porky-helper').logger;

module.exports = ctx => {
	return createCommand('list')
		.description('list the available plugins')
		.option('-a, --all', 'list the all plugins')
		.option('-d, --detail', 'show the plugin details')
		.action(opts => {
			ctx.mergeGlobalOpts(opts);
			pluginMgr.each(plugin => {
				if (opts.all || !plugin.hasError()) {
					let log = chalk.green(plugin.cmdName) + '  ' + plugin.name;
					if (opts.detail) {
						// TODO
						if (plugin.hasError()) {
							log += '\n' + plugin.getError().message;
						}
					}

					myLogger.log(log);
				}
			});
		});
};
