const path = require('path');
const BASE = path.join(__dirname, '..');
const GENERATORS = path.join(BASE, 'generators');

module.exports = {
	BASE,
	GENERATORS,

	EDITOR_CONFIG: 'editorconfig',

	GIT: 'git',
	GIT_ATTR: 'gitattributes',
	GIT_IGNORE: 'gitignore',
};
