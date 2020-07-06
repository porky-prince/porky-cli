const path = require('path');
const _ = require('lodash');
const { pkgDepPropPre } = require('./helper');

const checker = (module.exports = {
	/**
	 * Return a check number option function
	 * @param opt
	 * @returns {function(*=, *=): number}
	 */
	checkNumberFn(opt) {
		return (value, defaultValue) => {
			value = Number(value);
			if (isNaN(value)) {
				if (_.isNumber(defaultValue)) {
					value = defaultValue;
				} else {
					throw new Error(`error: options "${opt}" must be a number`);
				}
			}

			return value;
		};
	},

	/**
	 * Check package manager option
	 * @param name
	 * @returns {string}
	 */
	checkPkgMgr(name) {
		if (name !== 'yarn') {
			name = 'npm';
		}

		return name;
	},

	/**
	 * Check package.json dependencies prop prefix option
	 * @param pre
	 * @returns {string}
	 */
	checkPkgDepPropPre(pre) {
		const index = pkgDepPropPre.indexOf(pre);

		return pkgDepPropPre[index >= 0 ? index : 0];
	},

	isJsFile(filePath) {
		return checker.typeOfFile(filePath, '.js');
	},

	typeOfFile(filePath, fileExt) {
		const ext = filePath ? path.parse(filePath).ext : '';
		return Boolean(ext) && (fileExt ? fileExt === ext : true);
	},
});
