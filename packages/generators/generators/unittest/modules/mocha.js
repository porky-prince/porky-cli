const { DepModule } = require('../../../src/depModule');

module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep(new DepModule('mocha', '^8.2.1'), new DepModule('chai', '^4.3.4'));
	switch (opt.scriptType) {
		case 'ts':
			devDep(
				new DepModule('@types/mocha', '^8.2.1'),
				new DepModule('@types/chai', '^4.3.0'),
				new DepModule('ts-node', '^8.6.2')
			);
			args = 'ts-node/register "**/*.@(test|spec).ts?(x)"';
			break;
		case 'es':
			devDep(new DepModule('@babel/register', '^7.9.0'));
			args = '@babel/register "**/*.@(test|spec).js?(x)"';
			break;
		default:
			break;
	}

	script('test', `mocha${args ? ' --require ' + args : ''}`);
};
