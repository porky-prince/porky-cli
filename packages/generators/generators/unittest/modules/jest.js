module.exports = function(opt, pkg, devDep, script) {
	let args = null;
	devDep('jest');
	switch (opt.scriptType) {
		case 'ts':
			devDep('ts-jest', '@types/jest');
			args = '{\\"^.+\\\\.tsx?$\\":\\"ts-jest\\"}';
			break;
		case 'es':
			devDep('babel-jest');
			args = '{\\"^.+\\\\.jsx?$\\":\\"babel-jest\\"}';
			break;
	}
	script('test', `jest${args ? ' --transform=' + args : ''}`);
};
