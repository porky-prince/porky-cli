const inquirer = require('inquirer');
const {
	_,
	fs,
	pm,
	helper: { pkgJsonSync },
	logger: { myLogger, chalk },
} = require('porky-helper');
const runtime = require.resolve('generator-porky-runtime');
const { TEMPS } = require('../const');
const { runYo } = require('../helper');
const { defaultConfig, defaultRuntimeConfig, config, runtimeConfig } = require('../config');
const { createCommand } = require('commander');

function action(ctx, pkg) {
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

		let isOverwrite = true;
		if (fs.existsSync(ctx.runtimeDir)) {
			answers = await inquirer.prompt([
				{
					name: 'isOverwrite',
					type: 'confirm',
					message: `detect the "${ctx.runtimeDir}" already exists, whether to overwrite?`,
					default: false,
				},
			]);
			isOverwrite = answers.isOverwrite;
		}

		isOverwrite && (await generate(ctx, pkg));
		myLogger.success('init ok, thanks for using porky-cli!');
		myLogger.info('input the `porky -h` to start using.');
	});
}

// Generate runtime dir
async function generate(ctx, pkg) {
	await runYo(runtime, '--generateInto', ctx.runtimeDir);
	const runtimePkg = pkgJsonSync(ctx.runtimeDir, null, { throws: false }) || {};
	const runtimePkgDevDep = runtimePkg.devDependencies || {};
	runtimePkgDevDep.commander = pkg.dependencies.commander;
	runtimePkgDevDep['module-rooter'] = pkg.devDependencies['module-rooter'];
	runtimePkg.devDependencies = runtimePkgDevDep;
	pkgJsonSync(ctx.runtimeDir, runtimePkg, { spaces: 4 });
	await fs.copy(TEMPS, ctx.runtimeDir);
	await pm(ctx.packageManager, { execOpts: { cwd: ctx.runtimeDir } }).install();
}

module.exports = (ctx, pkg) => {
	if (!ctx.isInit) {
		action(ctx, pkg);
		return null;
	}

	return createCommand('init')
		.description('configure or reconfigure some init info')
		.action(() => {
			action(ctx, pkg);
		});
};
