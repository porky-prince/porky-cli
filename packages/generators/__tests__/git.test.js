const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { GIT, GIT_ATTR, GIT_IGNORE, PKG } = require('../src/const');
const { getGenerator, getConfigName } = require('../src/helper');

describe('test:git', () => {
	const gitIgnore = getConfigName(GIT_IGNORE);
	const gitAttr = getConfigName(GIT_ATTR);
	const github = 'https://github.com/';
	const dotGit = '.git';
	const Generator = getGenerator(GIT);

	it('creates the git config files and init the repository', () => {
		const gitAccount = 'porky-prince';
		const repoName = 'porky-cli';
		const repo = github + gitAccount + '/' + repoName;
		return helpers
			.run(Generator)
			.withOptions({
				gitAccount,
				repoName,
			})
			.then(() => {
				assert.file(gitIgnore);
				assert.file(gitAttr);
				assert.file(dotGit);

				assert.file(PKG);
				assert.jsonFileContent(PKG, {
					repository: repo + dotGit,
					homepage: repo + '#readme',
					bugs: repo + '/issues',
				});

				assert.fileContent(dotGit + '/config', '[remote "origin"]\n	url = ' + repo + dotGit);
			});
	});

	it('respects --generate-into option', () => {
		const other = 'other';
		const other_ = other + '/';
		const gitAccount = other + 'Account';
		const repoName = other + 'Name';
		const repo = github + gitAccount + '/' + repoName;
		return helpers
			.run(Generator)
			.withOptions({
				gitAccount,
				repoName,
				generateInto: other_,
			})
			.then(() => {
				assert.file(other_ + gitIgnore);
				assert.file(other_ + gitAttr);
				assert.file(other_ + dotGit);

				assert.file(other_ + PKG);
				assert.jsonFileContent(other_ + PKG, {
					repository: repo + dotGit,
					homepage: repo + '#readme',
					bugs: repo + '/issues',
				});

				assert.fileContent(
					other_ + dotGit + '/config',
					'[remote "origin"]\n	url = ' + repo + dotGit
				);
			});
	});

	it("doesn't add remote `origin` when `gitAccount` isn't passed", () => {
		return helpers
			.run(Generator)
			.withOptions({
				repoName: 'other-name',
			})
			.then(() => {
				assert.file(gitIgnore);
				assert.file(gitAttr);
				assert.file(dotGit);
				assert.file(PKG);

				assert.noFileContent(PKG, '"repository"');
				assert.noFileContent(dotGit + '/config', '[remote "origin"]');
			});
	});

	it("doesn't add remote `origin` when `repoName` isn't passed", () => {
		return helpers
			.run(Generator)
			.withOptions({
				repoName: '',
				gitAccount: 'other-account',
			})
			.then(() => {
				assert.file(gitIgnore);
				assert.file(gitAttr);
				assert.file(dotGit);
				assert.file(PKG);

				assert.noFileContent(PKG, '"repository"');
				assert.noFileContent(dotGit + '/config', '[remote "origin"]');
			});
	});
});
