const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');
const { chalk, myLogger } = require('porky-helper').logger;

module.exports = () => {
	return createCommand('list')
		.description('list the available plugins')
		.option('-a, --all', 'list the all plugins')
		.option('-d, --detail', 'show the plugin details')
		.action(opts => {
			pluginMgr.each(plugin => {
				if (opts.all || !plugin.hasError()) {
					let log = '';
					if (opts.detail) {
						log += 'cmd name: ' + chalk.green(plugin.cmdName) + '\n';
						log += 'plugin name: ' + chalk.green(plugin.name) + '\n';
						log += 'md5: ' + chalk.green(plugin.tempDirName);
						if (plugin.hasError()) {
							log += '\n' + chalk.red(plugin.getError().toString());
						}
					} else {
						log = chalk.green(plugin.cmdName) + '  ' + plugin.name;
					}

					log += '\n';
					myLogger.log(log);
				}
			});
		});
};
