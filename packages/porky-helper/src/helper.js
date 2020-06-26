const path = require('path');
const childProcess = require('child_process');
const crypto = require('crypto');
const _ = require('lodash');
const fs = require('fs-extra');
const versionSelectorType = require('version-selector-type');
const pkgDepPropPre = ['', 'dev', 'optional'];
const pkgDepPropPreStr = JSON.stringify(pkgDepPropPre);
const allPkgDepPropPre = pkgDepPropPre.concat(['peer', 'bundled']);
const allPkgDepPropPreStr = JSON.stringify(allPkgDepPropPre);

async function spawn(cmd, args, opts) {
	return new Promise((resolve, reject) => {
		const p = childProcess.spawn(
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

		p.on('close', code => {
			if (code > 0) {
				reject(code);
			} else {
				resolve(code);
			}
		});
	});
}

async function exec(cmd, opts, hideLog) {
	return new Promise((resolve, reject) => {
		const p = childProcess.exec(cmd, opts, (error, stdout) => {
			if (error) {
				error.stdout = stdout;
				reject(error);
			} else {
				resolve(stdout);
			}
		});

		!hideLog && p.stdout.on('data', console.log);

		!hideLog && p.stderr.on('data', console.log);
	});
}

const that = (module.exports = {
	exec,

	spawn,

	pkgPath(root) {
		return path.join(root, 'package.json');
	},

	async pkgJson(root, json, opts) {
		const pkgPath = that.pkgPath(root);
		return json ? fs.writeJson(pkgPath, json, opts) : fs.readJson(pkgPath, opts);
	},

	pkgJsonSync(root, json, opts) {
		const pkgPath = that.pkgPath(root);
		return json ? fs.writeJsonSync(pkgPath, json, opts) : fs.readJsonSync(pkgPath, opts);
	},

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
		return exec(`npm view ${pkg} version`, opts, true).then(stdout => {
			return _.trim(stdout);
		});
	},

	validDistTag(tag, strict) {
		return Boolean(strict ? versionSelectorType.strict(tag) : versionSelectorType(tag));
	},

	md5(data) {
		const md5 = crypto.createHash('md5');
		return md5.update(data).digest('hex');
	},
});
