module.exports = {
	getDevDepModules(scriptType) {
		let arr = null;
		switch (scriptType) {
			case 'ts':
				arr = ['ts-node', '@types/mocha'];
				break;
			case 'es':
				arr = ['@babel/register'];
				break;
		}
		return arr;
	},
};
