module.exports = api => {
	api.cache(true);

	return {
		compact: false,
		sourceMaps: true,
		presets: [
			[
				'@babel/preset-env',
				{
					targets: ['defaults'],
				},
			],
		],
	};
};
