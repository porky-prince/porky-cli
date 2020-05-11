const childProcess = require('child_process');
const path = require('path');
const _ = require('lodash');
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

function spawn(cmd, args, opts) {
	return childProcess.spawn(
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
}

async function exec(cmd, opts) {
	return new Promise((resolve, reject) => {
		childProcess.exec(cmd, opts, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout, stderr);
			}
		});
	});
}

module.exports = {
	exec,

	spawn,

	yoCliFile,

	runYO: function(...args) {
		return spawn('node ' + yoCliFile('yo'), args);
	},

	runYOComplete: function(...args) {
		return spawn('node ' + yoCliFile('yo-complete'), args);
	},
};
