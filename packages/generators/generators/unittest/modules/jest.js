module.exports = {
	getDevDepModules(scriptType) {
		let arr = null;
		switch (scriptType) {
			case 'ts':
				arr = ['ts-jest', '@types/jest'];
				break;
			case 'es':
				arr = ['babel-jest'];
				break;
		}
		return arr;
	},
};