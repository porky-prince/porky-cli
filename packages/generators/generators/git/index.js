const { GIT, GIT_ATTR, GIT_IGNORE } = require('../../src/const');
const AbstractGenerator = require('../../src/abstractGenerator');
const originUrl = require('git-remote-origin-url');
const { execSync } = require('child_process');
const path = require('path');
const _ = require('lodash');
const configs = {
	repoName: {
		type: String,
		default: path.basename(process.cwd()),
		desc: 'Name of the Git repository',
	},
	gitAccount: {
		type: String,
		desc: 'Git username or organization',
	},
	gitHost: {
		type: String,
		default: 'github.com',
		desc: 'Git host',
	},
	/* gitToken: {
		type: String,
		desc:
			"Git token for create repository at the github by default if you haven't created the repository yet\n  Notice:yon can also input 'echo %TOKEN%' or 'echo $token'",
	}, */
};

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, GIT);
		this._hasOriginUrl = false;
	}

	initializing() {
		this._copyConfigTemp2Dest(GIT_ATTR);

		this._copyConfigTemp2Dest(GIT_IGNORE);
	}

	async _getOriginUrl(repoName, gitAccount, gitToken) {
		return originUrl(this._destPath()).then(
			url => {
				this._hasOriginUrl = true;
				return url;
			},
			() => {
				if (repoName && gitToken) {
					if (gitAccount) {
						gitAccount = `in:user ${gitAccount}`;
					}

					if (/\w+ .+/.test(gitToken)) {
						gitToken = _.trim(execSync(gitToken).toString());
					}

					if (!/^\w{32}$/.test(gitToken)) {
						this.log('Invalid token: ' + gitToken);
						return;
					}

					// TODO create repository at the github
					return Promise.resolve();
				}
			}
		);
	}

	async writing() {
		const pkg = this._readPkg();
		const opts = this.options;
		let repo = pkg.repository;
		if (!repo) {
			let originUrl = await this._getOriginUrl(
				opts.repoName,
				opts.gitAccount,
				opts.gitToken,
				pkg.description
			);
			if (originUrl) {
				repo = originUrl;
				const result = /git@([\w.]+):([\w/-]+\.git)/.exec(originUrl);
				if (result) {
					// 'git@github.com:porky-prince/porky-cli.git' => 'https://github.com/porky-prince/porky-cli.git'
					originUrl = `https://${result[1]}/${result[2]}`;
				}
			} else if (opts.gitAccount && opts.repoName) {
				// Default github
				repo = `git@${opts.gitHost}:${opts.gitAccount}/${opts.repoName}.git`;
				originUrl = `https://${opts.gitHost}/${opts.gitAccount}/${opts.repoName}.git`;
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
		const opts = this.options;
		let repo = pkg.repository;

		// It is safe to run the git init command in an existing repository
		this.spawnCommandSync('git', ['init', '--quiet'], {
			cwd: this._destPath(),
		});

		if (repo && !this._hasOriginUrl) {
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
				if (/https?:/.test(repo)) {
					repo += '.git';
				} else {
					repo = `git@${opts.gitHost}:${pkg.repository}.git`;
				}
			}

			this.spawnCommandSync('git', ['remote', 'add', 'origin', repo], {
				cwd: this._destPath(),
			});
		}
	}
};

module.exports.configs = configs;
