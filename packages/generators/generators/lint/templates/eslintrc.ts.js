module.exports = {
	extends: ['xo', 'xo-typescript', 'prettier/@typescript-eslint'],
	env: {
		node: true,
		browser: true,
		jest: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {
		project: './tsconfig.json',
	},
	ignorePatterns: ['**/*.js'],
	rules: {
		'prettier/prettier': 'error',
		'comma-dangle': [
			'error',
			{
				objects: 'always',
			},
		],
		'@typescript-eslint/no-floating-promises': 'off',
		'capitalized-comments': 'off',
	},
	overrides: [],
};
