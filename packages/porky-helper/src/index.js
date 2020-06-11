const pm = require('./pm');
const _ = require('lodash');
const fs = require('fs-extra');

module.exports = {
	_,

	fs,

	pm,

	logger: require('./logger'),

	helper: require('./helper'),

	checker: require('./checker'),
};
