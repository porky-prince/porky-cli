const path = require('path');
const { exec } = require('child_process');
const _ = require('lodash');
const { GENERATORS } = require('./const');

const helper = {
	getGenerator(generatorName) {
		return require(path.join(GENERATORS, generatorName));
	},

	getTempPath(generatorName, tempName = '') {
		return path.join(GENERATORS, generatorName, 'templates', tempName);
	},

	getConfigName(tempName, exclude = '') {
		return '.' + tempName.replace(exclude, '');
	},

	getMarkdownName(tempName) {
		return tempName.toUpperCase() + '.md';
	},

	async getLatestVersion(module) {
		return new Promise((resolve, reject) => {
			exec(`npm view ${module} version`, (error, stdout) => {
				if (error) {
					console.error(error);
					reject(error);
				} else {
					resolve(_.trim(stdout));
				}
			});
		});
	},
};

module.exports = helper;
