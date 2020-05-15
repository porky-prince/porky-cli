module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep('mocha', 'chai');
	switch (opt.scriptType) {
		case 'ts':
			devDep('@types/mocha', '@types/chai', 'ts-node');
			args = 'ts-node/register "**/*.@(test|spec).ts?(x)"';
			break;
		case 'es':
			devDep('@babel/register');
			args = '@babel/register "**/*.@(test|spec).js?(x)"';
			break;
		default:
			break;
	}

	script('test', `mocha${args ? ' --require ' + args : ''}`);
};
