const _ = require('lodash');
const querystring = require('querystring');
const AbstractGenerator = require('../../src/abstractGenerator');
const { README } = require('../../src/const');
const { getTempPath, getMarkdownName } = require('../../src/helper');
const configs = {
	content: {
		type: String,
		desc: 'Readme content',
	},
	description: {
		type: String,
		desc: 'Project description',
	},
	inNodejs: {
		type: Boolean,
		default: true,
		desc: 'Using in nodejs',
	},
	inBrowser: {
		type: Boolean,
		desc: 'Using in browser',
	},
	inCmd: {
		type: Boolean,
		desc: 'Using in command line',
	},
};

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, README);
	}

	writing() {
		const opt = this.options;
		const pkg = this._readPkg();
		this.fs.copyTpl(
			this.templatePath(getTempPath(this._name, this._name)),
			this._destPath(getMarkdownName(this._name)),
			{
				projectName: pkg.name,
				safeProjectName: _.camelCase(pkg.name),
				escapedProjectName: querystring.escape(pkg.name),
				description: opt.description || pkg.description,
				author: pkg.author,
				license: pkg.license,
				content: opt.content,
				inNodejs: opt.inNodejs,
				inBrowser: opt.inBrowser,
				inCmd: opt.inCmd,
			}
		);
	}
};

module.exports.configs = configs;
