const { createCommand } = require('commander');
const {
	fs,
	logger: { logger },
	pm,
	helper,
} = require('porky-helper');
const { checkPlugin } = require('../helper');
const { PLUGIN_TYPE } = require('../const');

async function addPlugins(ctx, pluginNames) {
	const tasks = [];
	const remotePlugins = [];
	for (let i = pluginNames.length - 1; i >= 0; i--) {
		const pluginName = pluginNames[i];
		const type = checkPlugin(pluginName);
		switch (type) {
			case PLUGIN_TYPE.REMOTE:
				tasks.push(
					helper
						.getLatestVersion(pluginName)
						.then(() => {
							ctx.pluginsConfig.set(pluginName, type);
							remotePlugins.push(pluginName);
						})
						.catch(() => {
							logger.error(`${pluginName} is not in the '${ctx.registry}'`);
						})
				);
				break;
			case PLUGIN_TYPE.LOCAL:
			case PLUGIN_TYPE.FILE:
				tasks.push(
					fs.pathExists(pluginName).then(isExist => {
						if (isExist) {
							ctx.pluginsConfig.set(pluginName, type);
						} else {
							logger.error(`Cannot find path '${pluginName}'`);
						}
					})
				);
				break;
			default:
				logger.error('illegal plugin:', pluginName);
				break;
		}
	}

	await Promise.all(tasks);

	if (remotePlugins.length > 0) {
		await pm(ctx.packageManager, {
			execOpts: {
				cwd: ctx.runtimeDir,
			},
		}).add(remotePlugins);
	}
}

module.exports = ctx => {
	return createCommand('add')
		.arguments('<plugins...>')
		.description('add one or more plugins, it can be remote, local, or a js file')
		.on('--help', () => {
			console.log('');
			console.log('Examples:');
			console.log('  add npm package:');
			console.log('    $ porky add <package>');
			console.log('  add local dir:');
			console.log('    $ porky add /Users/admin/project/dir');
			console.log('  add local file:');
			console.log('    $ porky add /Users/admin/project/file.js');
		})
		.action(plugins => {
			addPlugins(ctx, plugins);
		});
};
