class Config {
	constructor() {
		this.packageManager = 'npm';
	}

	keys() {
		return Object.keys(this);
	}

	merge(config) {
		this.keys().forEach(key => {
			if (config[key]) {
				this[key] = config[key];
			}
		});
		return this;
	}
}

module.exports = new Config();
