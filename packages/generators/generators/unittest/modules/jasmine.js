module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep('jasmine');
	switch (opt.scriptType) {
		case 'ts':
			devDep('ts-node', '@types/jasmine');
			args = 'ts-node/register **/*.@(test|spec).ts?(x)';
			break;
		case 'es':
			devDep('@babel/register');
			args = '@babel/register **/*.@(test|spec).js?(x)';
			break;
	}
	script('test', `jasmine${args ? ' --require=' + args : ''}`);
};
