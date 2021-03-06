const path = require('path');
const { GENERATORS } = require('./const');

module.exports = {
	getGenerator(generatorName) {
		return require(path.join(GENERATORS, generatorName));
	},

	getTempPath(generatorName, tempName = '') {
		return path.join(GENERATORS, generatorName, 'templates', tempName);
	},

	getConfigName(tempName, exclude = '') {
		return ('.' + tempName).replace(exclude, '');
	},

	getMarkdownName(tempName) {
		return tempName.toUpperCase() + '.md';
	},

	getTestFilename(moduleName, ext = 'js') {
		return `test/${moduleName}.test.${ext}`;
	},
};
