const { createCommand } = require('commander');

module.exports = ctx => {
	const program = createCommand('add');
	return program
		.arguments('<plugins...>')
		.description('add one or more plugins, it can be remote, local, or a js file')
		.action(plugins => {
			console.log(plugins);
			console.log(ctx);
		});
};
