const _ = require('lodash');
const { pkgDepPropPre } = require('./helper');

module.exports = {
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
};
