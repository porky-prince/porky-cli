const fs = require('fs-extra');
const { createCommand } = require('commander');
const {
	logger: { logger },
	pm,
	helper,
} = require('porky-helper');
const { checkPlugin } = require('../helper');
const { PLUGIN_TYPE } = require('../const');

async function addPlugins(ctx, plugins) {
	const tasks = [];
	const remotePlugins = [];
	for (let i = plugins.length - 1; i >= 0; i--) {
		const plugin = plugins[i];
		const type = checkPlugin(plugin);
		switch (type) {
			case PLUGIN_TYPE.REMOTE:
				tasks.push(
					helper
						.getLatestVersion(plugin)
						.then(() => {
							ctx.pluginsConfig.set(plugin, type);
							remotePlugins.push(plugin);
						})
						.catch(() => {
							logger.error(`E404: ${plugin} is not in the '${ctx.registry}'`);
						})
				);
				break;
			case PLUGIN_TYPE.LOCAL:
			case PLUGIN_TYPE.FILE:
				tasks.push(
					fs.pathExists(plugin).then(isExist => {
						if (isExist) {
							ctx.pluginsConfig.set(plugin, type);
						} else {
							logger.error(`E404: Cannot find '${plugin}'`);
						}
					})
				);
				break;
			default:
				logger.error('illegal plugin:', plugin);
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
		.action(plugins => {
			addPlugins(ctx, plugins);
		});
};
