const log4js = require('log4js');
const chalk = require('chalk');
const _ = require('lodash');
const logSymbols = {
	info: chalk.blue('i'),
	success: chalk.green('√'),
	warning: chalk.yellow('!'),
	error: chalk.red('×'),
};

log4js.configure({
	appenders: { out: { type: 'stdout', layout: { type: 'messagePassThrough' } } },
	categories: { default: { appenders: ['out'], level: 'all' } },
});

const logger = log4js.getLogger();

module.exports = _.merge(log4js, {
	logger,

	chalk,

	logSymbols,

	log() {
		logger.info.apply(logger, arguments);
	},

	info() {
		logger.info(logSymbols.info, chalk.blue.apply(chalk, _.toArray(arguments)));
	},

	warn() {
		logger.warn(logSymbols.warning, chalk.yellow.apply(chalk, _.toArray(arguments)));
	},

	success() {
		logger.info(logSymbols.success, chalk.green.apply(chalk, _.toArray(arguments)));
	},

	error() {
		logger.error(logSymbols.error, chalk.red.apply(chalk, _.toArray(arguments)));
	},

	throwErr(msg) {
		throw new Error(msg);
	},

	level(level) {
		if (level) logger.level = level;

		return level;
	},

	off() {
		logger.level = 'off';
	},
});
