const _ = require('lodash');
const querystring = require('querystring');
const Generator = require('../../src/abstractGenerator');
const { README } = require('../../src/const');
const { getTempPath } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = README;
		this._buildDestOpt();

		this.option('name', {
			type: String,
			required: true,
			desc: 'Project name',
		});

		this.option('description', {
			type: String,
			required: true,
			desc: 'Project description',
		});

		this.option('gitAccount', {
			type: String,
			required: true,
			desc: 'Git username or organization',
		});

		this.option('repoName', {
			type: String,
			required: true,
			desc: 'Name of the Git repository',
		});

		this.option('authorName', {
			type: String,
			required: true,
			desc: 'Author name',
		});

		this.option('authorUrl', {
			type: String,
			required: true,
			desc: 'Author url',
		});

		this.option('coveralls', {
			type: Boolean,
			required: true,
			desc: 'Include coveralls badge',
		});

		this.option('content', {
			type: String,
			required: false,
			desc: 'Readme content',
		});
	}

	writing() {
		const pkg = this._readPkg();
		this.fs.copyTpl(
			this.templatePath(getTempPath(this._name, this._name)),
			this._destPath(this._name.toUpperCase() + '.md'),
			{
				projectName: this.options.name,
				safeProjectName: _.camelCase(this.options.name),
				escapedProjectName: querystring.escape(this.options.name),
				repositoryName: this.options.repositoryName || this.options.name,
				description: this.options.description,
				githubAccount: this.options.githubAccount,
				author: {
					name: this.options.authorName,
					url: this.options.authorUrl,
				},
				license: pkg.license,
				includeCoveralls: this.options.coveralls,
				content: this.options.content,
			}
		);
	}
};
