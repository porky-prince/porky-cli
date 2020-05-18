const childProcess = require('child_process');
const _ = require('lodash');
const versionSelectorType = require('version-selector-type');
const pkgDepPropPre = ['', 'dev', 'optional'];
const pkgDepPropPreStr = JSON.stringify(pkgDepPropPre);
const allPkgDepPropPre = pkgDepPropPre.concat(['peer', 'bundled']);
const allPkgDepPropPreStr = JSON.stringify(allPkgDepPropPre);

function spawn(cmd, args, opts) {
	return childProcess.spawn(
		cmd,
		args,
		_.merge(
			{
				stdio: 'inherit',
				shell: true,
			},
			opts
		)
	);
}

async function exec(cmd, opts, hideLog) {
	return new Promise((resolve, reject) => {
		const p = childProcess.exec(cmd, opts, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});

		!hideLog && p.stdout.on('data', console.log);

		!hideLog && p.stderr.on('data', console.log);
	});
}

module.exports = {
	exec,

	spawn,

	// Package.json dependencies prop prefix
	pkgDepPropPre,

	// Package.json dependencies prop prefix json string
	pkgDepPropPreStr,

	// Package.json all dependencies prop prefix
	allPkgDepPropPre,

	// Package.json all dependencies prop prefix json string
	allPkgDepPropPreStr,

	/**
	 * Get package.json dependencies prop by prefix
	 * @param pre
	 * @param defaultValue
	 * @returns {string}
	 */
	getPkgDepProp(pre, defaultValue = '') {
		const i = pkgDepPropPre.indexOf(pre);
		if (i === -1) pre = defaultValue;
		return pre + `${i > 0 ? 'D' : 'd'}ependencies`;
	},

	/**
	 * Get package latest version
	 * @param pkg
	 * @param opts
	 * @returns {Promise<string>}
	 */
	async getLatestVersion(pkg, opts) {
		return exec(`npm view ${pkg} version`, opts).then(stdout => {
			return _.trim(stdout);
		});
	},

	validDistTag(tag, strict) {
		return Boolean(strict ? versionSelectorType.strict(tag) : versionSelectorType(tag));
	},
};
