const path = require('path');
const BASE = path.join(__dirname, '..');
const GENERATORS = path.join(BASE, 'generators');
const UNIT_TEST_MODULES_JSON = '["jest", "mocha", "jasmine"]';
const UNIT_TEST_MODULES = JSON.parse(UNIT_TEST_MODULES_JSON);
const SCRIPT_TYPES_JSON = '["js", "ts", "es"]';
const SCRIPT_TYPES = JSON.parse(SCRIPT_TYPES_JSON);

module.exports = {
	BASE,
	GENERATORS,
	PKG: 'package.json',

	APP: 'app',
	APP_ENTRY: 'src/main',
	TS_CONFIG: 'tsconfig.json',
	BABEL_JS: 'babelrc.js',

	EDITOR_CONFIG: 'editorconfig',

	GIT_ATTR: 'gitattributes',
	GIT_IGNORE: 'gitignore',

	README: 'readme',

	LINT: 'lint',

	UNIT_TEST: 'unittest',

	UNIT_TEST_MODULES_JSON,
	UNIT_TEST_MODULES,

	SCRIPT_TYPES_JSON,
	SCRIPT_TYPES,

	CLI: 'cli',
	CLI_JS: 'bin/cli.js',
};
