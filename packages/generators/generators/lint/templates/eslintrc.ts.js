module.exports = {
	extends: ['xo', 'xo-typescript', 'prettier/@typescript-eslint'],
	env: {
		jest: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {
		project: './tsconfig.eslint.json',
	},
	rules: {
		'prettier/prettier': 'error',
	},
	overrides: [],
};
