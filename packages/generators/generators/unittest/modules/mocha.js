module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep('mocha');
	switch (opt.scriptType) {
		case 'ts':
			devDep('ts-node', '@types/mocha');
			args = 'ts-node/register **/*.@(test|spec).ts?(x)';
			break;
		case 'es':
			devDep('@babel/register');
			args = '@babel/register **/*.@(test|spec).js?(x)';
			break;
	}
	script('test', `mocha${args ? ' --require=' + args : ''}`);
};
