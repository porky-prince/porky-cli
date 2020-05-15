module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep('jest');
	switch (opt.scriptType) {
		case 'ts':
			devDep('@types/jest', 'ts-jest');
			args = '{\\"^.+\\\\.tsx?$\\":\\"ts-jest\\"}';
			break;
		case 'es':
			devDep('babel-jest');
			args = '{\\"^.+\\\\.jsx?$\\":\\"babel-jest\\"}';
			break;
		default:
			break;
	}

	script('test', `jest${args ? ' --transform=' + args : ''}`);
};
