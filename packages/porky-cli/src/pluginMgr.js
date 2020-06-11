const path = require('path');
const pIsPromise = require('p-is-promise');
const { createCommand } = require('commander');
const {
	_,
	fs,
	helper: { pkgJson },
	checker,
} = require('porky-helper');
const { PLUGIN_TYPE, ENTRY_JS, CONFIG_MARKS } = require('./const');
const { isCommander } = require('./helper');

class Plugin {
	constructor(name, type) {
		this._name = name;
		this._type = type;
		this._cmd = null;
		this._error = null;
	}

	get name() {
		return this._name;
	}

	get type() {
		return this._type;
	}

	getCmd() {
		return this._cmd;
	}

	setCmd(cmd) {
		this._cmd = cmd;
	}

	hasError() {
		return this._error !== null;
	}

	setError(msg, where) {
		this._error = new Error(msg);
		this._error.where = where || '';
	}
}

class PluginMgr {
	constructor() {
		this._plugins = {};
		this._ctx = null;
	}

	has(cmdName) {
		return cmdName in this._plugins;
	}

	/**
	 * Resolving naming conflicts
	 * @param name
	 * @param suffix
	 * @returns {string} cmdName
	 */
	fixedName(name, suffix = 0) {
		const cmdName = suffix > 0 ? name + suffix : name;
		if (this.has(cmdName)) {
			return this.fixedName(name, ++suffix);
		}

		return cmdName;
	}

	/**
	 * Add command to plugin
	 * @param plugin
	 * @param cmdName
	 * @param entryPath
	 * @param entry
	 * @returns {Plugin} plugin
	 */
	addCmd2Plugin(plugin, cmdName, entryPath, entry) {
		entry = entry || require(entryPath);
		if (_.isFunction(entry)) {
			plugin.setCmd(
				createCommand(this.fixedName(cmdName))
					.description('unknown params, up to you')
					.allowUnknownOption()
					.action(entry)
			);
		} else if (isCommander(entry)) {
			plugin.setCmd(entry.name(this.fixedName(entry.name())));
		} else {
			plugin.setError(
				"Error: return value 'entry' must be a function or commander",
				entryPath
			);
		}

		return plugin;
	}

	async addRemotePlugin(plugin) {
		const ctx = this._ctx;
		const { findPkgRoot } = require(ctx.runtimeDir);
		const root = findPkgRoot(plugin.name);
		if (root) {
			const pkg = await pkgJson(root);
			const entryPath = path.join(root, ENTRY_JS);
			let cmdName = pkg.name;
			if (await fs.pathExists(entryPath)) {
				const content = await fs.readFile(entryPath, 'utf8');
				if (content.indexOf(CONFIG_MARKS.MARK) > 0) {
					let exports = require(entryPath);
					if (_.isFunction(exports)) {
						exports = exports(ctx);
						if (pIsPromise(exports)) exports = await exports;
						if (_.isObject(exports)) {
							if (exports.entry) {
								cmdName = exports.name || cmdName;
								this.addCmd2Plugin(plugin, cmdName, entryPath, exports.entry);
							} else {
								plugin.setError(
									`Error: return value 'entry' cannot be '${exports.entry}'`,
									entryPath
								);
							}
						} else {
							plugin.setError(`Error: invalid return value '${exports}'`, entryPath);
						}
					} else {
						plugin.setError(
							`Error: exports must be a function '${exports}'`,
							entryPath
						);
					}
				} else {
					this.addCmd2Plugin(plugin, cmdName, entryPath);
				}
			} else {
				if (checker.isJsFile(pkg.main)) {
					this.addCmd2Plugin(plugin, cmdName, path.join(root, pkg.main));
					return;
				}

				const entryIndexPath = path.join(root, 'index.js');
				if (await fs.pathExists(entryIndexPath)) {
					this.addCmd2Plugin(plugin, cmdName, entryIndexPath);
					return;
				}
			}

			plugin.setError(`Error: invalid config ${entryPath}`, entryPath);
		} else {
			plugin.setError(`Error: Cannot find module '${plugin.name}'`);
		}
	}

	async init(ctx) {
		this._ctx = ctx;
		const pluginNames = ctx.pluginsConfig.keys();
		for (let i = 0, length = pluginNames.length; i < length; i++) {
			const name = pluginNames[i];
			const type = ctx.pluginsConfig.get(name);
			const plugin = new Plugin(name, type);
			switch (type) {
				case PLUGIN_TYPE.REMOTE:
					this.addRemotePlugin(plugin);
					break;
				case PLUGIN_TYPE.LOCAL:
					break;
				case PLUGIN_TYPE.FILE:
					break;
				default:
					break;
			}
		}
	}
}

module.exports = new PluginMgr();
