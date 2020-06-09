const { createCommand } = require('commander');
const { pm } = require('porky-helper');
const { PLUGIN_TYPE } = require('../const');

async function removePlugins(ctx, plugins) {
	const remotePlugins = [];
	for (let i = plugins.length - 1; i >= 0; i--) {
		const plugin = plugins[i];
		const type = ctx.pluginsConfig.get(plugin);
		if (type !== null) {
			ctx.pluginsConfig.del(plugin);
			type === PLUGIN_TYPE.REMOTE && remotePlugins.push(plugin);
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
