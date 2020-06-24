const inquirer = require('inquirer');
const {
	_,
	logger: { myLogger, chalk },
} = require('porky-helper');
const { defaultConfig, defaultRuntimeConfig, config, runtimeConfig } = require('../config');
const { createCommand } = require('commander');

function action() {
	myLogger.log(chalk.green('Welcome to using porky-cli!'));
	myLogger.info('please configure some init info:');
	const prompts = [];
	_.each(defaultConfig, createPrompt);
	_.each(defaultRuntimeConfig, createPrompt);
	function createPrompt(configObj, name) {
		const obj = { name };
		_.merge(obj, configObj);
		prompts.push(obj);
	}

	inquirer.prompt(prompts).then(answers => {
		_.each(answers, (val, key) => {
			// Safe set, limit by default config
			config.set(key, val);
			runtimeConfig.set(key, val);
		});
		// Generate runtime dir
		myLogger.success('init ok, thanks for using porky-cli!');
		myLogger.info('input the `porky -h` to start using.');
	});
}

module.exports = ctx => {
	if (!ctx.isInit) {
		action();
		return null;
	}

	return createCommand('init')
		.arguments('[generator]')
		.description('configure or reconfigure some init info')
		.action(() => {
			action();
		});
};
