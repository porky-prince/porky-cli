const path = require('path');
const BASE = path.join(__dirname, '..');
const GENERATORS = path.join(BASE, 'generators');

module.exports = {
	BASE,
	GENERATORS,
	PKG: 'package.json',

	EDITOR_CONFIG: 'editorconfig',

	GIT_ATTR: 'gitattributes',
	GIT_IGNORE: 'gitignore',

	README: 'readme',
};
