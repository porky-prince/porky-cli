const { createCommand } = require('commander');
const { fs, pm } = require('porky-helper');
const { PLUGIN_TYPE } = require('../const');
const pluginMgr = require('../pluginMgr');

async function removePlugins(ctx, pluginNames) {
	const remotePlugins = [];
	for (let i = pluginNames.length - 1; i >= 0; i--) {
		const pluginName = pluginNames[i];
		const type = ctx.pluginsConfig.get(pluginName);
		if (type !== null) {
			const plugin = pluginMgr.getByName(pluginName);
			ctx.pluginsConfig.del(pluginName);
			if (fs.existsSync(plugin.getTempDir())) {
				await fs.remove(plugin.getTempDir());
			}

			type === PLUGIN_TYPE.REMOTE && remotePlugins.push(pluginName);
		}
	}

	if (remotePlugins.length > 0) {
		await pm(ctx.packageManager, {
			execOpts: {
				cwd: ctx.runtimeDir,
			},
		}).remove(remotePlugins);
	}
}

module.exports = ctx => {
	return createCommand('remove')
		.arguments('<plugins...>')
		.description('remove one or more plugins, it can be remote, local, or a js file')
		.action(plugins => {
			removePlugins(ctx, plugins);
		});
};
