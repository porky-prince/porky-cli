const path = require('path');
const { GENERATORS } = require('./const');

const helper = {
	getGenerator(generatorName) {
		return require(path.join(GENERATORS, generatorName));
	},

	getTempPath(generatorName, tempName) {
		return require.resolve(path.join(GENERATORS, generatorName, 'templates', tempName));
	},

	getConfigName(tempName) {
		return '.' + tempName;
	},
};

module.exports = helper;
