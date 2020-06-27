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
const { isCommander, checkPlugin } = require('./helper');

class Plugin {
	constructor(name, type, ctx) {
		this._name = name;
		this._shortName = path.parse(name).name;
		// Short name is default cmd name
		this._cmdName = this._shortName;
		this._tempDirName = md5(name);
		this._type = type;
		this._ctx = ctx;
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

	get eventName() {
		return 'command:' + this._cmdName;
	}

	get tempDirName() {
		return this._tempDirName;
	}

	getTempDir() {
		return path.join(this._ctx.runtimeTempDir, this.tempDirName);
	}

	get type() {
		return this._type;
	}

	inRuntime() {
		return this._ctx.isRuntimePlugin(this._name);
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

	getError() {
		return this._error;
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
		this._curRunPlugin = null;
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

	each(cb) {
		_.each(this._plugins, cb);
	}

	clearRunCache() {
		const curRunPlugin = this._curRunPlugin;
		if (this._ctx.clear && curRunPlugin) {
			fs.existsSync(curRunPlugin.getTempDir()) && fs.removeSync(curRunPlugin.getTempDir());
		}

		this._curRunPlugin = null;
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
	 * Deal plugin entry
	 * @param {Plugin} plugin
	 * @param entryPath
	 * @param entry
	 * @returns {Command}
	 */
	dealPluginEntry(plugin, entryPath, entry) {
		if (_.isFunction(entry)) {
			// Create commander
			const fn = entry;
			entry = createCommand(plugin.cmdName)
				.description(plugin.name)
				.allowUnknownOption()
				.action(opts => {
					const args = opts.args.slice(0);
					this._ctx.json && args.push(this._ctx.json);
					fn.apply(null, args);
				});
		} else if (isCommander(entry)) {
			// Entry is commander
		} else if (entry) {
			entry = null;
			plugin.setError(
				'the return object "entry" prop should be a function or commander.',
				entryPath
			);
		}

		return entry;
	}

	/**
	 * Set command to plugin
	 * @param {Plugin} plugin
	 * @param entryPath
	 * @param entry
	 * @returns {boolean}
	 */
	setCmd2Plugin(plugin, entryPath, entry) {
		try {
			entry = entry || require(entryPath);
		} catch (e) {
			entry = null;
			plugin.setError(e.message, e.stack);
		}

		entry = this.dealPluginEntry(plugin, entryPath, entry);

		if (entry) {
			plugin.cmdName = this.fixCmdName(entry.name());
			const _actionHandler = entry._actionHandler;
			if (_actionHandler) {
				entry._actionHandler = args => {
					this._curRunPlugin = plugin;
					_actionHandler.call(entry, args);
				};
			}

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
		if (fs.existsSync(pkgPath(root))) {
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
		if (fs.existsSync(indexJsPath)) {
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
		const { getPkgRooter } = ctx.runtimeBridge;
		let rooter = getPkgRooter(plugin.name);
		if (rooter.exist) {
			rooter = rooter(ENTRY_JS);
			if (rooter.exist) {
				await this.dealPluginByEntryJs(plugin, rooter.cd);
			} else {
				await this.dealPluginByDefault(plugin, rooter.root);
			}
		} else {
			plugin.setError(`Cannot find module '${plugin.name}'.`, ctx.runtimeDir);
		}

		this.add(plugin);
	}

	async _addLocalPluginByCache(plugin, tempDirPath) {
		if (fs.existsSync(tempDirPath)) {
			const entryPath = path.join(tempDirPath, ENTRY_JS);
			if (fs.existsSync(entryPath)) {
				await this.dealPluginByEntryJs(plugin, entryPath);
			} else {
				await this.dealPluginByDefault(plugin, tempDirPath);
			}

			this.add(plugin);
			return true;
		}

		return false;
	}

	async addLocalPlugin(plugin) {
		// A path for local module here
		const root = plugin.name;
		let tempDirPath = root;

		if (!plugin.inRuntime()) tempDirPath = plugin.getTempDir();

		// Using cache at first
		if (await this._addLocalPluginByCache(plugin, tempDirPath)) return;

		await fs.remove(tempDirPath);
		if (fs.existsSync(root)) {
			let entryPath = path.join(root, ENTRY_JS);
			if (fs.existsSync(entryPath)) {
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

	async _addFilePluginByCache(plugin, entryPath) {
		if (fs.existsSync(entryPath)) {
			await this.dealPluginByEntryJs(plugin, entryPath);
			this.add(plugin);
			return true;
		}

		return false;
	}

	async addFilePlugin(plugin) {
		const tempDirPath = plugin.getTempDir();
		// A path for local file here
		const root = plugin.name;
		let entryPath = root;

		if (!plugin.inRuntime()) entryPath = path.join(tempDirPath, plugin.shortName + '.js');

		// Using cache at first
		if (await this._addFilePluginByCache(plugin, entryPath)) return;

		await fs.remove(tempDirPath);
		if (fs.existsSync(root)) {
			const entryContent = await fs.readFile(root, 'utf8');
			if (entryContent.indexOf(CONFIG_MARKS.NO_RUNTIME) === -1) {
				await fs.copy(root, entryPath);
			} else {
				entryPath = root;
			}

			await this.dealPluginByEntryJs(plugin, entryPath, entryContent);
		} else {
			plugin.setError(`Cannot find plugin '${plugin.shortName}'.`, root);
		}

		this.add(plugin);
	}

	async init(ctx) {
		this._ctx = ctx;
		const runtimePluginsDir = ctx.runtimePluginsDir;
		const pluginNames = ctx.pluginsConfig.keys();
		if (fs.existsSync(runtimePluginsDir)) {
			fs.readdirSync(runtimePluginsDir).forEach(name => {
				pluginNames.push(path.join(runtimePluginsDir, name));
			});
		}

		await Promise.all(
			pluginNames.map(name => {
				let type = ctx.pluginsConfig.get(name);
				if (!type) type = checkPlugin(name);
				const plugin = new Plugin(name, type, ctx);
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
