const log4js = require('log4js');
const chalk = require('chalk');
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

class Logger {
	constructor(logger) {
		this._logger = logger;
	}

	log() {
		const _logger = this._logger;
		_logger === logger
			? _logger.info.apply(_logger, arguments)
			: _logger.log.apply(_logger, arguments);
	}

	info() {
		this._logger.info(logSymbols.info, chalk.blue.apply(chalk, arguments));
	}

	warn() {
		this._logger.warn(logSymbols.warning, chalk.yellow.apply(chalk, arguments));
	}

	success() {
		this._logger.info(logSymbols.success, chalk.green.apply(chalk, arguments));
	}

	error() {
		this._logger.error(logSymbols.error, chalk.red.apply(chalk, arguments));
	}

	throwErr(msg) {
		throw new Error(msg);
	}

	level(level) {
		// That's right to use 'logger' instead of 'this._logger'
		if (level) logger.level = level;

		return level;
	}

	off() {
		this.level('off');
	}
}

module.exports = {
	// Global log
	logger: new Logger(logger),

	// Why 'console' ?
	// Because log4js level = 'off' will close all log, whether it is logger or new logger
	// Sometimes I want to keep a log when level = 'off'
	myLogger: new Logger(console),

	log4js,

	chalk,

	logSymbols,
};
