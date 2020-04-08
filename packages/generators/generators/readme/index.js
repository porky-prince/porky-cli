const _ = require('lodash');
const querystring = require('querystring');
const Generator = require('../../src/abstractGenerator');
const { README } = require('../../src/const');
const { getTempPath, getMarkdownName } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = README;
		this._buildDestOpt();

		this.option('content', {
			type: String,
			desc: 'Readme content',
		});

		this.option('description', {
			type: String,
			desc: 'Project description',
		});

		this.option('inNodejs', {
			type: Boolean,
			default: true,
			desc: 'Using in nodejs',
		});

		this.option('inBrowser', {
			type: Boolean,
			desc: 'Using in browser',
		});

		this.option('inCmd', {
			type: Boolean,
			desc: 'Using in command line',
		});
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
