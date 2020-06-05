const path = require('path');
const fs = require('fs');
const validatePackageName = require('validate-npm-package-name');
const NODE_MODULES = 'node_modules' + path.sep;

function findRootDir(filePath) {
	const info = path.parse(filePath);
	const index = info.dir.lastIndexOf(NODE_MODULES) + NODE_MODULES.length;
	const dirs = info.dir.slice(index).split(path.sep);
	// @user/module/... or module/... find module
	return filePath.slice(0, index) + (dirs[0][0] === '@' ? dirs[0] + path.sep + dirs[1] : dirs[0]);
}

function createResult(root, error, paths) {
	const result = (...otherPaths) => {
		return createResult(root, error, otherPaths);
	};

	paths.unshift(root);
	result.root = root;
	result.cd = root ? path.join.apply(path, paths) : '';
	result.exist = root ? fs.existsSync(result.cd) : false;
	result.error = error;

	return result;
}

module.exports = _require => {
	_require = _require || require;

	return (moduleId, ...otherPaths) => {
		let root = '';
		let error = '';
		const result = validatePackageName(moduleId);
		// Must be module
		if (result.validForOldPackages && result.validForNewPackages) {
			let filePath = null;
			try {
				filePath = _require.resolve(moduleId);
			} catch (err) {
				if (err.path) {
					// No entry, err.path => package.json
					filePath = err.path;
				} else {
					// Module not found
					error += err.message;
				}
			}

			if (filePath !== null) root = findRootDir(filePath);
		} else {
			if (result.errors) error += result.errors.join('\n');
			if (result.warnings) error += result.warnings.join('\n');
		}

		return createResult(root, error, otherPaths);
	};
};
