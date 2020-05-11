const childProcess = require('child_process');
const _ = require('lodash');
const { BASE } = require('./const');

function spawn(cmd, args, opts) {
	return childProcess.spawn(
		cmd,
		args,
		_.merge(
			{
				cwd: BASE,
				stdio: 'inherit',
				shell: true,
			},
			opts
		)
	);
}

async function exec(cmd, opts) {
	return new Promise((resolve, reject) => {
		childProcess.exec(
			cmd,
			_.merge(
				{
					cwd: BASE,
				},
				opts
			),
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
				} else {
					resolve(stdout, stderr);
				}
			}
		);
	});
}

module.exports = {
	exec,

	spawn,

	runYO: function(...args) {
		return spawn('npx yo', args);
	},

	runYOComplete: function(...args) {
		return spawn('npx yo-complete', args);
	},
};
