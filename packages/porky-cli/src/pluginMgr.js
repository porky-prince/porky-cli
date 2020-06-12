const path = require('path');
const pIsPromise = require('p-is-promise');
const { createCommand } = require('commander');
const {
	_,
	fs,
	helper: { pkgPath, pkgJson, md5 },
	checker,
} = require('porky-helper');
const { PLUGIN_TYPE, ENTRY_JS, CONFIG_MARKS } = require('./const');
const { isCommander } = require('./helper');

class Plugin {
	constructor(name, type) {
		this._name = name;
		this._cmdName = path.parse(name).name;
		this._tempName = md5(name);
		this._type = type;
		this._cmd = null;
		this._error = null;
	}

	get name() {
		return this._name;
	}

	get cmdName() {
		return this._cmdName;
	}

	set cmdName(value) {
		this._cmdName = value;
	}

	get tempName() {
		return this._tempName;
	}

	get type() {
		return this._type;
	}

	hasCmd() {
		return this._cmd !== null;
	}

	getCmd() {
		return this._cmd;
	}

	getCmdName() {
		return this._cmd.name();
	}

	setCmd(cmd) {
		this._cmd = cmd;
	}

	hasError() {
		return this._error !== null;
	}

	setError(msg, stack) {
		this._error = new Error(msg);
		this._error.stack = stack || '';
	}
}

class PluginMgr {
	constructor() {
		this._cmdNames = {};
		this._plugins = {};
		this._ctx = null;
	}

	hasCmd(cmdName) {
		return cmdName in this._cmdNames;
	}

	add(plugin) {
		this._plugins[plugin.name] = plugin;
	}

	remove(plugin) {
		this.removeByName(plugin.name);
	}

	removeByName(name) {
		const plugin = this.getByName(name);
		if (plugin !== null) {
			if (plugin.hasCmd()) {
				delete this._cmdNames[plugin.getCmdName()];
			}

			delete this._plugins[name];
		}
	}

	getByName(name) {
		return this._plugins[name] || null;
	}

	/**
	 * Resolving naming conflicts
	 * @param cmdName
	 * @param suffix
	 * @returns {string}
	 */
	fixCmdName(cmdName, suffix = 0) {
		const _cmdName = suffix > 0 ? cmdName + suffix : cmdName;
		if (this.hasCmd(_cmdName)) {
			return this.fixCmdName(cmdName, ++suffix);
		}

		return _cmdName;
	}

	/**
	 * Set command to plugin
	 * @param plugin
	 * @param cmdName
	 * @param entryPath
	 * @param entry
	 * @returns {boolean}
	 */
	setCmd2Plugin(plugin, cmdName, entryPath, entry) {
		try {
			entry = entry || require(entryPath);
			if (_.isFunction(entry)) {
				// Create commander
				entry = createCommand(cmdName)
					.description('unknown params, up to you')
					.allowUnknownOption()
					.action(entry);
			} else if (isCommander(entry)) {
				// Commander
			} else {
				entry = null;
				plugin.setError(
					"Error: return value 'entry' must be a function or commander",
					entryPath
				);
			}
		} catch (e) {
			entry = null;
			plugin.set(e.message, e.stack);
		}

		if (entry) {
			plugin.setCmd(entry.name(this.fixCmdName(entry.name())));
			this._cmdNames[entry.name()] = plugin.name;
			return true;
		}

		return false;
	}

	async setCmd2PluginByPkg(plugin, root) {
		if (await fs.pathExists(pkgPath(root))) {
			const pkg = await pkgJson(root, { throws: false });
			if (pkg && checker.isJsFile(pkg.main)) {
				return this.setCmd2Plugin(plugin, pkg.name, path.join(root, pkg.main));
			}
		}

		return false;
	}

	async setCmd2PluginByIndexJs(plugin, root) {
		const indexJsPath = path.join(root, 'index.js');
		if (await fs.pathExists(indexJsPath)) {
			return this.setCmd2Plugin(plugin, plugin.cmdName, indexJsPath);
		}

		return false;
	}

	async addRemotePlugin(plugin) {
		const ctx = this._ctx;
		const { findPkgRoot } = require(ctx.runtimeDir);
		const name = plugin.name;
		const root = findPkgRoot(name);
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
								this.setCmd2Plugin(plugin, cmdName, entryPath, exports.entry);
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
							`Error: must be exports a function '${exports}'`,
							entryPath
						);
					}
				} else {
					this.setCmd2Plugin(plugin, cmdName, entryPath);
				}
			} else {
				const entryIndexPath = path.join(root, 'index.js');
				if (checker.isJsFile(pkg.main)) {
					this.setCmd2Plugin(plugin, cmdName, path.join(root, pkg.main));
				} else if (await fs.pathExists(entryIndexPath)) {
					this.setCmd2Plugin(plugin, cmdName, entryIndexPath);
				} else {
					plugin.setError(`Error: invalid plugin ${name}`, root);
				}
			}
		} else {
			plugin.setError(`Error: Cannot find module '${name}'`);
		}

		this.add(plugin);
	}

	async addLocalPlugin(plugin, cache) {
		const ctx = this._ctx;
		let root = plugin.name; // A path
		const name = path.parse(root).name; // Dir name
		const tempDir = path.join(ctx.runtimeTempDir, plugin.tempName);
		if (await fs.pathExists(tempDir)) {
			if (cache) {
				// Do
			} else {
				// Do
			}
		} else if (await fs.pathExists(root)) {
			let entryPath = path.join(root, ENTRY_JS);
			let cmdName = name;
			if (await fs.pathExists(entryPath)) {
				const content = await fs.readFile(entryPath, 'utf8');
				if (content.indexOf(CONFIG_MARKS.NO_RUNTIME) === -1) {
					await fs.copy(root, tempDir);
					root = tempDir;
					entryPath = path.join(root, ENTRY_JS);
				}

				if (content.indexOf(CONFIG_MARKS.MARK) > 0) {
					let exports = require(entryPath);
					if (_.isFunction(exports)) {
						exports = exports(ctx);
						if (pIsPromise(exports)) exports = await exports;
						if (_.isObject(exports)) {
							if (exports.entry) {
								cmdName = exports.name || cmdName;
								this.setCmd2Plugin(plugin, cmdName, entryPath, exports.entry);
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
							`Error: must be exports a function '${exports}'`,
							entryPath
						);
					}
				} else {
					this.setCmd2Plugin(plugin, cmdName, entryPath);
				}
			} else {
				await fs.copy(root, tempDir);
				root = tempDir;

				plugin.setError(`Error: invalid plugin ${name}`, root);
			}
		} else {
			plugin.setError(`Error: Cannot find module ${name}`, root);
		}

		this.add(plugin);
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
					this.addLocalPlugin(plugin);
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
