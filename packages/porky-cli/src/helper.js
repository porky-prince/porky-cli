const { helper } = require('porky-helper');
const path = require('path');
const yoCliFiles = {};

function yoCliFile(cliName) {
	let cliFile = yoCliFiles[cliName];
	if (!cliFile) {
		let yo = null;
		try {
			yo = require.resolve('yo');
		} catch (err) {
			const yoPkg = require(err.path);
			yoCliFiles[cliName] = cliFile = path.join(path.dirname(err.path), yoPkg.bin[cliName]);
		}

		if (yo !== null) throw new Error('yo changed yo\'s package.json "main" entry:' + yo);
	}

	return cliFile;
}

module.exports = {
	yoCliFile,

	runYo(...args) {
		return helper.spawn('node ' + yoCliFile('yo'), args);
	},

	runYoComplete(...args) {
		return helper.spawn('node ' + yoCliFile('yo-complete'), args);
	},
};
