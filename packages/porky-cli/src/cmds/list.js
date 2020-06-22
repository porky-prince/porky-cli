const { createCommand } = require('commander');
const pluginMgr = require('../pluginMgr');
const { chalk, myLogger } = require('porky-helper').logger;

module.exports = () => {
	return createCommand('list')
		.description('list available plugins')
		.option('-a, --all', 'list all plugins', false)
		.option('-p, --plugin <regexp>', 'list the plugins whose names match the regex', '.*')
		.option('-c, --cmd <regexp>', 'list the plugins whose commands names match the regex', '.*')
		.option('-d, --detail', 'show the plugin details', false)
		.action(opts => {
			pluginMgr.each(plugin => {
				if (opts.all || !plugin.hasError()) {
					const reg = new RegExp(opts.plugin);
					if (!reg.test(plugin.name)) return;
					reg.compile(opts.cmd);
					if (!reg.test(plugin.cmdName)) return;
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
