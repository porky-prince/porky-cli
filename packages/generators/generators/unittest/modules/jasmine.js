module.exports = function(opt, pkg, devDep, script) {
	let args = '"**!(node_modules)/*.@(test|spec).js?(x)"';
	devDep('jasmine');
	switch (opt.scriptType) {
		case 'ts':
			devDep('ts-node', '@types/jasmine');
			args = '--require=ts-node/register "**!(node_modules)/*.@(test|spec).ts?(x)"';
			break;
		case 'es':
			devDep('@babel/register');
			args = '--require=@babel/register ' + args;
			break;
	}
	script('test', `jasmine ${args}`);
};
