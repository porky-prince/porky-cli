const fs = require('fs-extra');
const yml = require('js-yaml');

const that = {
	ext: 'yml',

	isDone(val) {
		return val && !(val instanceof Error);
	},

	safeParse(configPath) {
		const obj = that.safeLoad(configPath);
		return that.isDone(obj) ? obj : {};
	},

	safeLoad(configPath) {
		if (fs.existsSync(configPath)) {
			try {
				return yml.safeLoad(fs.readFileSync(configPath, 'utf8'));
			} catch (e) {
				return e;
			}
		}

		return null;
	},

	safeDump(path, obj) {
		try {
			fs.outputFileSync(
				path,
				yml.safeDump(obj, {
					styles: {
						'!!null': 'canonical',
					},
					sortKeys: true,
				}),
				'utf8'
			);
			return obj;
		} catch (e) {
			return e;
		}
	},
};

module.exports = that;
