const { createCommand } = require('commander');
const { fs, pm } = require('porky-helper');
const { PLUGIN_TYPE } = require('../const');
const pluginMgr = require('../pluginMgr');

async function removePlugins(ctx, pluginNames, onlyCache, clean) {
	const remotePlugins = [];
	for (let i = pluginNames.length - 1; i >= 0; i--) {
		const pluginName = pluginNames[i];
		const type = ctx.pluginsConfig.get(pluginName);
		if (type !== null) {
			const plugin = pluginMgr.getByName(pluginName);
			if (!clean || plugin.hasError()) {
				if (!onlyCache) {
					ctx.pluginsConfig.del(pluginName);
					type === PLUGIN_TYPE.REMOTE && remotePlugins.push(pluginName);
				}

				if (fs.existsSync(plugin.getTempDir())) {
					await fs.remove(plugin.getTempDir());
				}
			}
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
		.arguments('[plugins...]')
		.description('remove one or more plugins, it can be remote, local, or a js file')
		.option('-a, --all', 'remove all plugins', false)
		.option('-o, --only-cache', 'only remove the plugins caches', false)
		.option('-c, --clean', 'remove the unavailable plugins', false)
		.on('--help', () => {
			console.log('');
			console.log('Examples:');
			console.log('  remove the all plugins caches:');
			console.log('    $ porky remove -a -o');
			console.log('  remove the all unavailable plugins:');
			console.log('    $ porky remove -a -c');
		})
		.action((plugins, opts) => {
			if (opts.all) plugins = ctx.pluginsConfig.keys();
			removePlugins(ctx, plugins, opts.onlyCache, opts.clean);
		});
};
