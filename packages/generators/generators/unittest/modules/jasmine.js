const { DepModule } = require('../../../src/depModule');

module.exports = function(opt, pkg, devDep, script) {
	let args = '"**!(node_modules)/*.@(test|spec).js?(x)"';
	devDep(new DepModule('jasmine', '^3.6.4'));
	switch (opt.scriptType) {
		case 'ts':
			devDep(new DepModule('@types/jasmine', '^3.6.4'), new DepModule('ts-node', '^8.6.2'));
			args = '--require=ts-node/register "**!(node_modules)/*.@(test|spec).ts?(x)"';
			break;
		case 'es':
			devDep(new DepModule('@babel/register', '^7.9.0'));
			args = '--require=@babel/register ' + args;
			break;
		default:
			break;
	}

	script('test', `jasmine ${args}`);
};
