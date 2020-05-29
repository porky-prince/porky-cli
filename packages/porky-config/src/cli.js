const { createCommand } = require('commander');

module.exports = (cmdName, config) => {
	const program = createCommand(cmdName || 'config');
	program
		.description(`Manages the ${config.fullName} configuration file.`)
		.usage('<cmd> [options]')
		.command('get <key>')
		.description('get config item')
		.action(key => {
			config.get(key, true);
		});
	program
		.command('set <key> <value>')
		.description('set config item')
		.action((key, value) => {
			if (value) {
				if (/^\d+$/.test(value)) {
					value = parseInt(value, 10);
				} else if (value === 'true') {
					value = true;
				} else if (value === 'false') {
					value = false;
				}

				config.set(key, value);
			}
		});
	program
		.command('del <key>')
		.description('delete config item')
		.action(key => {
			config.del(key);
		});
	program
		.command('reset')
		.description('reset config items')
		.action(() => {
			config.reset();
		});
	program
		.command('list [showDefaultConfig]')
		.description('list config items')
		.action(showDefaultConfig => {
			config.list(showDefaultConfig);
		});
	return program;
};
