const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const { createCommand } = require('commander');
const {
	helper: { PKG },
	checker,
} = require('porky-helper');
const { PLUGIN_TYPE, CONFIG_JS, CONFIG_MARKS } = require('../const');
const { isCommander } = require('../helper');
let program = null;
let ctx = null;

async function dealRemote(plugin) {
	const { findPkgRoot } = require(ctx.runtimeDir);
	const root = findPkgRoot(plugin);
	if (root) {
		const configJsPath = path.join(root, CONFIG_JS);
		const pkg = await fs.readJson(path.join(root, PKG));
		let name = pkg.name;
		if (await fs.pathExists(configJsPath)) {
			const content = await fs.readFile(configJsPath, 'utf8');
			if (content.indexOf(CONFIG_MARKS.MARK) > 0) {
				const obj = require(configJsPath)(ctx);
				const entry = obj.entry;
				if (obj.name) name = obj.name;
				if (entry) {
					if (_.isString(entry)) {
						if (checker.isJsFile(entry)) {
							atLastExports(name, require(path.join(root, entry)));
						} else {
							// Error must js file
						}
					} else {
						atLastExports(name, entry);
					}
				} else {
					// Error no entry
				}
			} else {
				atLastExports(name, require(configJsPath));
			}
		} else if (checker.isJsFile(pkg.entry)) {
			atLastExports(name, require(path.join(root, pkg.entry)));
		}
	}
}

function atLastExports(name, exports) {
	if (_.isFunction(exports)) {
		program.addCommand(
			createCommand(name)
				.allowUnknownOption()
				.action(exports)
		);
	} else if (_.isObject(exports) && isCommander(exports)) {
		program.addCommand(exports);
	} else {
		// Error unknown exports
	}
}

module.exports = _ctx => {
	ctx = _ctx;
	program = createCommand('run')
		.arguments('<cmd>')
		.description('run the command provided by the added plugin');

	const plugins = ctx.pluginsConfig.keys();
	for (let i = 0, length = plugins.length; i < length; i++) {
		const plugin = plugins[i];
		const type = ctx.pluginsConfig.get(plugin);
		switch (type) {
			case PLUGIN_TYPE.REMOTE:
				dealRemote(plugin);
				break;
			case PLUGIN_TYPE.LOCAL:
				break;
			case PLUGIN_TYPE.FILE:
				break;
			default:
				break;
		}
	}

	return program;
};
