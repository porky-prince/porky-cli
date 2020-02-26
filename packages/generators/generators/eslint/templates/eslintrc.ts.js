module.exports = {
	extends: ['xo', 'xo-typescript', 'prettier/@typescript-eslint'],
	env: {
		jest: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {},
	rules: {
		'prettier/prettier': 'error',
	},
	overrides: [],
};
