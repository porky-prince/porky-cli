module.exports = {
	extends: ['xo', 'prettier'],
	env: {
		node: true,
		browser: true,
		jest: true,
	},
	plugins: ['prettier'],
	parserOptions: {},
	rules: {
		'prettier/prettier': 'error',
		'capitalized-comments': 'off',
	},
	overrides: [],
};
