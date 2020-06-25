const inquirer = require('inquirer');
const {
	_,
	logger: { myLogger, chalk },
} = require('porky-helper');
const runtime = require.resolve('generator-porky-runtime');
const { runYo } = require('../helper');
const { defaultConfig, defaultRuntimeConfig, config, runtimeConfig } = require('../config');
const { createCommand } = require('commander');

function action(ctx) {
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

	inquirer.prompt(prompts).then(async answers => {
		_.each(answers, (val, key) => {
			// Safe set, limit by default config
			config.set(key, val);
			runtimeConfig.set(key, val);
		});
		// Generate runtime dir
		await runYo(runtime, '--generateInto', ctx.runtimeDir);
		myLogger.success('init ok, thanks for using porky-cli!');
		myLogger.info('input the `porky -h` to start using.');
	});
}

module.exports = ctx => {
	if (!ctx.isInit) {
		action(ctx);
		return null;
	}

	return createCommand('init')
		.description('configure or reconfigure some init info')
		.action(() => {
			action(ctx);
		});
};
