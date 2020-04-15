const { UNIT_TEST_MODULES } = require('../../../src/const');

const obj = {};
UNIT_TEST_MODULES.forEach(moduleName => {
	obj[moduleName] = require('./' + moduleName);
});

module.exports = obj;
