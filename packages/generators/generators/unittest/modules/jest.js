const { DepModule } = require('../../../src/depModule');

module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep(new DepModule('jest', '^26.1.0'));
	switch (opt.scriptType) {
		case 'ts':
			devDep(new DepModule('@types/jest', '^26.1.0'), new DepModule('ts-jest', '^26.1.1'));
			args = '{\\"^.+\\\\.tsx?$\\":\\"ts-jest\\"}';
			break;
		case 'es':
			devDep(new DepModule('babel-jest', '^26.1.0'));
			args = '{\\"^.+\\\\.jsx?$\\":\\"babel-jest\\"}';
			break;
		default:
			break;
	}

	script('test', `jest${args ? ' --transform=' + args : ''}`);
};
