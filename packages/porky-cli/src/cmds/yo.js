const { execSync } = require('child_process');

function runYO(...args) {
	return execSync('npx yo ' + args.join(' '));
}

function showYOLog(arg) {
	console.log(runYO(arg).toString());
}

module.exports = program => {
	program
		.command('yo')
		.usage('[options]')
		.description('CLI tool for running Yeoman generators http://yeoman.io')
		.allowUnknownOption()
		.option('--yoh', 'the yo help')
		.option('--yov', 'the yo version')
		.option('--myo', 'some custom generators')
		.action(options => {
			if (options.yoh) {
				showYOLog('--help');
			} else if (options.yov) {
				showYOLog('--version');
			} else if (options.myo) {
				runYO('@porky-prince/generators');
			} else {
				runYO.apply(null, options.args);
			}
		});
};
