const { cliPath } = require('dependency-version-sync');

module.exports = () => {
	return require(cliPath);
};
