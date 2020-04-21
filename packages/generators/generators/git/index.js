const { GIT, GIT_ATTR, GIT_IGNORE } = require('../../src/const');
const AbstractGenerator = require('../../src/abstractGenerator');
const originUrl = require('git-remote-origin-url');
const configs = {
	gitAccount: {
		type: String,
		desc: 'Git username or organization',
	},
	repoName: {
		type: String,
		desc: 'Name of the Git repository',
	},
};

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, GIT);
	}

	initializing() {
		this._copyConfigTemp2Dest(GIT_ATTR);

		this._copyConfigTemp2Dest(GIT_IGNORE);

		return originUrl(this._destPath()).then(
			url => {
				this.originUrl = url;
			},
			() => {
				this.originUrl = '';
			}
		);
	}

	writing() {
		const pkg = this._readPkg();
		let repo = pkg.repository;
		if (!repo) {
			let originUrl = (repo = this.originUrl);
			if (originUrl) {
				const result = /git@([\w\.]+)\:([\w\/-]+\.git)/.exec(originUrl);
				if (result) {
					// 'git@github.com:porky-prince/porky-cli.git' => 'https://github.com/porky-prince/porky-cli.git'
					originUrl = `https://${result[1]}/${result[2]}`;
				}
			} else if (this.options.gitAccount && this.options.repoName) {
				// default github
				originUrl = repo = `https://github.com/${this.options.gitAccount}/${this.options.repoName}.git`;
			}

			if (repo) {
				pkg.repository = repo;
				pkg.homepage = pkg.homepage || originUrl.replace('.git', '#readme');
				pkg.bugs = pkg.bugs || originUrl.replace('.git', '/issues');
			}
		}
		this._writePkg(pkg);
	}

	end() {
		const pkg = this._readPkg();
		let repo = pkg.repository;

		// It is safe to run the git init command in an existing repository
		this.spawnCommandSync('git', ['init', '--quiet'], {
			cwd: this._destPath(),
		});

		if (repo && !this.originUrl) {
			// {type, url}
			if (typeof repo !== 'string') {
				if (repo.type !== 'git') return;
				repo = repo.url;
			}
			// 'git@github.com:porky-prince/porky-cli.git'
			// 'https://github.com/porky-prince/porky-cli.git'
			// 'https://github.com/porky-prince/porky-cli'
			// 'porky-prince/porky-cli' // default github
			if (repo.indexOf('.git') === -1) {
				if (/https?\:/.test(repo)) {
					repo += '.git';
				} else {
					repo = 'git@github.com:' + pkg.repository + '.git';
				}
			}
			this.spawnCommandSync('git', ['remote', 'add', 'origin', repo], {
				cwd: this._destPath(),
			});
		}
	}
};

module.exports.path = __dirname;
module.exports.configs = configs;
