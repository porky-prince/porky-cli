const fs = require('fs-extra');
const path = require('path');
const { exec, pkgDepPropPre, getPkgDepProp, validDistTag } = require('porky-helper').helper;

let depsCache = null;

async function getInstalledDeps(opts) {
	if (depsCache === null) {
		let result = null;
		await exec(
			'npm ls -j --depth 0',
			{
				cwd: opts.cwd,
				encoding: 'utf8',
				timeout: 3e4,
			},
			true
		)
			.then(stdout => {
				result = stdout;
			})
			.catch(error => {
				console.error(error.message);
				result = error.stdout;
			});

		const { dependencies } = JSON.parse(result);
		if (dependencies) {
			depsCache = dependencies;
		} else {
			// Try it once if haven't installed
			await installedDeps(opts);
			depsCache = (await getInstalledDeps(opts)) || {};
		}
	}

	return depsCache;
}

async function installedDeps(opts) {
	if (opts.install) {
		await exec(`${opts.packageManager} install`, {
			cwd: opts.cwd,
			encoding: 'utf8',
		});
	}
}

async function dealPkg(opts, pkg) {
	for (let i = pkgDepPropPre.length - 1; i >= 0; i--) {
		const pre = pkgDepPropPre[i];
		const deps = pkg[getPkgDepProp(pre)];
		if (deps && (opts.pre === undefined || opts.pre === pre)) {
			const keys = Object.keys(deps);
			for (let j = keys.length - 1; j >= 0; j--) {
				const dep = keys[j];
				if (opts.filter && !new RegExp(opts.filter).test(dep)) continue;

				const originVersion = deps[dep];
				// Ignore github:porky-prince/test, git+https://github.com/porky-prince/test.git, etc
				if (!validDistTag(originVersion)) {
					console.log('Ignore', dep, ':', originVersion);
					continue;
				}

				const depCache = (await getInstalledDeps(opts))[dep];
				if (!depCache) {
					console.log(`Package "${dep}" has not been installed`);
					continue;
				}

				if (depCache.version) {
					deps[dep] = `^${depCache.version}`;
					console.log(dep, ':', originVersion, '->', deps[dep]);
				} else if (depCache.peerMissing) {
					console.warn('Peer dep missing: ' + dep);
				} else {
					console.warn('There is something wrong on dep: ' + dep);
				}
			}
		}
	}
}

module.exports = async opts => {
	const cwd = opts.cwd || process.cwd();
	const pkgPath = path.join(cwd, 'package.json');
	opts.cwd = cwd;
	if (await fs.exists(pkgPath)) {
		const pkg = await fs.readJson(pkgPath);
		await dealPkg(opts, pkg);
		await fs.writeJson(pkgPath, pkg, {
			spaces: 4,
		});
		await installedDeps(opts);
	} else {
		throw new Error("Can't find package.json");
	}
};

module.exports.cliPath = require.resolve('../bin/cli.js');
