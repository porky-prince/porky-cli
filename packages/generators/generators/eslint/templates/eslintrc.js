module.exports = {
	extends: ['xo', 'prettier'],
	env: {
		jest: true,
	},
	plugins: ['prettier'],
	parserOptions: {},
	rules: {
		'prettier/prettier': 'error',
	},
	overrides: [],
};
