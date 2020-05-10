const { GIT, GIT_ATTR, GIT_IGNORE } = require('../../src/const');
const AbstractGenerator = require('../../src/abstractGenerator');
const originUrl = require('git-remote-origin-url');
const { execSync } = require('child_process');
const path = require('path');
const { Octokit } = require('@octokit/rest');
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
	gitToken: {
		type: String,
		desc:
			"Git token for create repository at the github by default if you haven't created the repository yet\n  Notice:yon can also input 'echo %TOKEN%' or 'echo $token'",
	},
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

	async _getOriginUrl(repoName, gitToken, description) {
		return originUrl(this._destPath()).then(
			url => {
				this._hasOriginUrl = true;
				return url;
			},
			() => {
				if (repoName && gitToken) {
					if (/\w+ .+/.test(gitToken)) {
						gitToken = execSync(gitToken).toString();
					}

					const octokit = new Octokit({
						auth: _.trim(gitToken),
					});
					return octokit.search
						.repos({
							q: `${repoName} in:name`,
						})
						.then(rsp => {
							if (rsp.data.total_count === 0) {
								return octokit.repos
									.createForAuthenticatedUser({
										name: repoName,
										description,
									})
									.then(rsp => {
										return rsp.data.clone_url;
									})
									.catch(_.noop);
							}

							return rsp.data.items[0].clone_url;
						})
						.catch(_.noop);
				}
			}
		);
	}

	async writing() {
		const pkg = this._readPkg();
		const opts = this.options;
		let originUrl = await this._getOriginUrl(opts.repoName, opts.gitToken, pkg.description);
		let repo = pkg.repository;
		if (!repo) {
			if (originUrl) {
				const result = /git@([\w.]+):([\w/-]+\.git)/.exec(originUrl);
				if (result) {
					// 'git@github.com:porky-prince/porky-cli.git' => 'https://github.com/porky-prince/porky-cli.git'
					originUrl = `https://${result[1]}/${result[2]}`;
				}
			} else if (opts.gitAccount && opts.repoName) {
				// Default github
				originUrl = repo = `https://github.com/${opts.gitAccount}/${opts.repoName}.git`;
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
					repo = 'git@github.com:' + pkg.repository + '.git';
				}
			}

			this.spawnCommandSync('git', ['remote', 'add', 'origin', repo], {
				cwd: this._destPath(),
			});
		}
	}
};

module.exports.configs = configs;
