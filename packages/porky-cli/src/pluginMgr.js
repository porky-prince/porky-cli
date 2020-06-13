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
		this._shortName = path.parse(name).name;
		// Short name is default cmd name
		this._cmdName = this._shortName;
		this._tempDirName = md5(name);
		this._type = type;
		this._cmd = null;
		this._error = null;
	}

	get name() {
		return this._name;
	}

	get shortName() {
		return this._shortName;
	}

	get cmdName() {
		return this._cmdName;
	}

	set cmdName(value) {
		if (value) this._cmdName = value;
	}

	get tempDirName() {
		return this._tempDirName;
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

	setCmd(cmd) {
		if (cmd) this._cmd = cmd.name(this._cmdName);
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
				delete this._cmdNames[plugin.cmdName];
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
		const name = suffix > 0 ? cmdName + suffix : cmdName;
		if (this.hasCmd(name)) {
			return this.fixCmdName(cmdName, ++suffix);
		}

		return name;
	}

	/**
	 * Set command to plugin
	 * @param {Plugin} plugin
	 * @param cmdName
	 * @param entryPath
	 * @param entry
	 * @returns {boolean}
	 */
	setCmd2Plugin(plugin, entryPath, entry) {
		try {
			entry = entry || require(entryPath);
			if (_.isFunction(entry)) {
				// Create commander
				entry = createCommand(plugin.cmdName)
					.description('unknown params, up to you')
					.allowUnknownOption()
					// TODO
					.action(entry);
			} else if (isCommander(entry)) {
				// Commander
			} else {
				entry = null;
				plugin.setError(
					'the return object "entry" prop should be a function or commander.',
					entryPath
				);
			}
		} catch (e) {
			entry = null;
			plugin.setError(e.message, e.stack);
		}

		if (entry) {
			plugin.cmdName = this.fixCmdName(entry.name());
			plugin.setCmd(entry);
			this._cmdNames[plugin.cmdName] = plugin.name;
			return true;
		}

		return false;
	}

	async dealPluginByEntryJs(plugin, entryPath, entryContent) {
		if (!entryContent) entryContent = await fs.readFile(entryPath, 'utf8');

		if (!entryContent) {
			plugin.setError('entry js is empty.', entryPath);
			return false;
		}

		if (entryContent.indexOf(CONFIG_MARKS.MARK) === -1)
			return this.setCmd2Plugin(plugin, entryPath);

		try {
			let exports = require(entryPath);
			if (_.isFunction(exports)) {
				exports = exports(this._ctx);
				if (pIsPromise(exports)) exports = await exports;
				if (_.isObject(exports)) {
					if (exports.entry) {
						plugin.cmdName = exports.name;
						return this.setCmd2Plugin(plugin, entryPath, exports.entry);
					}

					plugin.setError(`the return object 'entry' prop is require.`, entryPath);
				} else {
					plugin.setError(
						`the export function should be return a object, but the return is '${exports}'.`,
						entryPath
					);
				}
			} else {
				plugin.setError(
					`should be export a function, but the return is '${exports}'.`,
					entryPath
				);
			}
		} catch (e) {
			plugin.setError(e.message, e.stack);
		}

		return false;
	}

	async dealPluginByPkg(plugin, root) {
		if (await fs.pathExists(pkgPath(root))) {
			const pkg = await pkgJson(root, null, { throws: false });
			if (pkg && checker.isJsFile(pkg.main)) {
				plugin.cmdName = pkg.name;
				return this.setCmd2Plugin(plugin, path.join(root, pkg.main));
			}
		}

		return false;
	}

	async dealPluginByIndexJs(plugin, root) {
		const indexJsPath = path.join(root, 'index.js');
		if (await fs.pathExists(indexJsPath)) {
			return this.setCmd2Plugin(plugin, indexJsPath);
		}

		return false;
	}

	async dealPluginByDefault(plugin, root) {
		if (!(await this.dealPluginByPkg(plugin, root))) {
			if (!(await this.dealPluginByIndexJs(plugin, root))) {
				plugin.setError(`invalid plugin '${plugin.shortName}'.`, root);
				return false;
			}
		}

		return true;
	}

	async addRemotePlugin(plugin) {
		const ctx = this._ctx;
		const { findPkgRoot } = require(ctx.runtimeDir);
		const root = findPkgRoot(plugin.name);
		if (root) {
			const entryPath = path.join(root, ENTRY_JS);
			if (await fs.pathExists(entryPath)) {
				await this.dealPluginByEntryJs(plugin, entryPath);
			} else {
				await this.dealPluginByDefault(plugin, root);
			}
		} else {
			plugin.setError(`Cannot find module '${plugin.name}'.`, ctx.runtimeDir);
		}

		this.add(plugin);
	}

	async addLocalPlugin(plugin, cache) {
		const ctx = this._ctx;
		const tempDirPath = path.join(ctx.runtimeTempDir, plugin.tempDirName);
		// A path for local module here
		const root = plugin.name;
		if (await fs.pathExists(tempDirPath)) {
			if (cache) {
				// Do something
			} else {
				// Do something
			}
		} else if (await fs.pathExists(root)) {
			let entryPath = path.join(root, ENTRY_JS);
			if (await fs.pathExists(entryPath)) {
				const entryContent = await fs.readFile(entryPath, 'utf8');
				if (entryContent.indexOf(CONFIG_MARKS.NO_RUNTIME) === -1) {
					await fs.copy(root, tempDirPath);
					entryPath = path.join(tempDirPath, ENTRY_JS);
				}

				await this.dealPluginByEntryJs(plugin, entryPath, entryContent);
			} else {
				await fs.copy(root, tempDirPath);
				await this.dealPluginByDefault(plugin, tempDirPath);
			}
		} else {
			plugin.setError(`Cannot find plugin '${plugin.shortName}'.`, root);
		}

		this.add(plugin);
	}

	async addFilePlugin(plugin, cache) {
		const ctx = this._ctx;
		const tempDirPath = path.join(ctx.runtimeTempDir, plugin.tempDirName);
		// A path for local file here
		const root = plugin.name;
		if (await fs.pathExists(tempDirPath)) {
			if (cache) {
				// Do something
			} else {
				// Do something
			}
		} else if (await fs.pathExists(root)) {
			let entryPath = root;
			const entryContent = await fs.readFile(entryPath, 'utf8');
			if (entryContent.indexOf(CONFIG_MARKS.NO_RUNTIME) === -1) {
				entryPath = path.join(tempDirPath, plugin.shortName + '.js');
				await fs.copy(root, entryPath);
			}

			await this.dealPluginByEntryJs(plugin, entryPath, entryContent);
		} else {
			plugin.setError(`Cannot find plugin '${plugin.shortName}'.`, root);
		}

		this.add(plugin);
	}

	async init(ctx) {
		this._ctx = ctx;
		await Promise.all(
			ctx.pluginsConfig.keys().map(name => {
				const type = ctx.pluginsConfig.get(name);
				const plugin = new Plugin(name, type);
				switch (type) {
					case PLUGIN_TYPE.REMOTE:
						return this.addRemotePlugin(plugin);
					case PLUGIN_TYPE.LOCAL:
						return this.addLocalPlugin(plugin);
					case PLUGIN_TYPE.FILE:
						return this.addFilePlugin(plugin);
					default:
						plugin.setError(`unknown plugin '${name}'.`);
						this.add(plugin);
						return Promise.resolve(plugin);
				}
			})
		);
	}
}

module.exports = new PluginMgr();
