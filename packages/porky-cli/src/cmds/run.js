const { createCommand } = require('commander');

module.exports = async () => {
	const program = createCommand('run')
		.arguments('<cmd>')
		.description('run the command provided by the added plugin')
		.option('-j, --json', 'the args received from the command line are passed in JSON format');

	return program;
};
