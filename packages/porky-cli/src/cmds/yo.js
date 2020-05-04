const { execSync } = require('child_process');

module.exports = program => {
	program
		.command('yo')
		.usage('[options]')
		.description('CLI tool for running Yeoman generators http://yeoman.io')
		.allowUnknownOption()
		.option('--yoh', 'the yo help')
		.option('--yov', 'the yo version')
		.action(options => {
			if (options.yoh) {
				console.log(execSync('npx yo --help').toString());
			} else if (options.yov) {
				console.log(execSync('npx yo --version').toString());
			} else {
				console.log(options.args);
			}
		});
};
