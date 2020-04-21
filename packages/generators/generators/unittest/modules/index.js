const { UNIT_TEST_MODULES } = require('../../../src/const');

UNIT_TEST_MODULES.forEach(moduleName => {
	exports[moduleName] = require('./' + moduleName);
});
