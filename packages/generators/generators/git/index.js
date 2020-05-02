const { GIT, GIT_ATTR, GIT_IGNORE } = require('../../src/const');
const AbstractGenerator = require('../../src/abstractGenerator');
const originUrl = require('git-remote-origin-url');
const configs = {
	repoName: {
		type: String,
		desc: 'Name of the Git repository',
	},
	gitAccount: {
		type: String,
		desc: 'Git username or organization',
	},
	gitPwd: {
		type: String,
		desc:
			"Git password for create repository at the github by default if you haven't created the repository yet, notice:use token better",
	},
	gitToken: {
		type: String,
		desc:
			"Git token for create repository at the github by default if you haven't created the repository yet, notice:yon also can input 'echo %TOKEN%' or 'echo $token'",
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

	async writing() {
		await originUrl(this._destPath()).then(
			url => {
				this.originUrl = url;
			},
			() => {
				// this.originUrl = '';
				const opts = this.options;
				if (opts.repoName) {
					if (opts.gitAccount && opts.gitPwd) {
					} else if (opts.gitToken) {
						if (/\w+ .+/.test(opts.gitToken)) {
						} else {
						}
					}
				}
			}
		);

		const pkg = this._readPkg();
		const opts = this.options;
		let repo = pkg.repository;
		if (!repo) {
			let originUrl = (repo = this.originUrl);
			if (originUrl) {
				const result = /git@([\w\.]+)\:([\w\/-]+\.git)/.exec(originUrl);
				if (result) {
					// 'git@github.com:porky-prince/porky-cli.git' => 'https://github.com/porky-prince/porky-cli.git'
					originUrl = `https://${result[1]}/${result[2]}`;
				}
			} else if (opts.gitAccount && opts.repoName) {
				// default github
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
