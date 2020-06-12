const validatePackageName = require('validate-npm-package-name');
const path = require('path');
const { _, checker, helper } = require('porky-helper');
const { PLUGIN_TYPE } = require('./const');
const yoCliFiles = {};

function yoCliFile(cliName) {
	let cliFile = yoCliFiles[cliName];
	if (!cliFile) {
		let yo = null;
		try {
			yo = require.resolve('yo');
		} catch (err) {
			const yoPkg = require(err.path);
			yoCliFiles[cliName] = cliFile = path.join(path.dirname(err.path), yoPkg.bin[cliName]);
		}

		if (yo !== null) throw new Error('yo changed yo\'s package.json "main" entry:' + yo);
	}

	return cliFile;
}

function checkPlugin(plugin) {
	const result = validatePackageName(plugin);
	if (result.validForNewPackages && result.validForOldPackages) {
		// Remote module
		return PLUGIN_TYPE.REMOTE;
	}

	if (path.isAbsolute(plugin) && path.parse(plugin).name) {
		// Local module or file
		return checker.isJsFile(plugin) ? PLUGIN_TYPE.FILE : PLUGIN_TYPE.LOCAL;
	}

	return PLUGIN_TYPE.UNKNOWN;
}

module.exports = {
	yoCliFile,

	runYo(...args) {
		return helper.spawn('node ' + yoCliFile('yo'), args);
	},

	runYoComplete(...args) {
		return helper.spawn('node ' + yoCliFile('yo-complete'), args);
	},

	checkPlugin,

	isCommander(obj) {
		return (
			_.isObject(obj) &&
			_.isFunction(obj.help) &&
			_.isFunction(obj.helpOption) &&
			_.isFunction(obj.helpInformation)
		);
	},
};
