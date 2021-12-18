class DepModule {
	constructor(name, version = 'latest') {
		this._name = name;
		this._version = version;
	}

	getName() {
		return this._name;
	}

	getVersion(opts) {
		return opts.useLatest ? 'latest' : this._version;
	}
}

exports.depConfig = function(cfg) {
	cfg.useLatest = {
		type: Boolean,
		default: false,
		desc: 'Using the latest dependency version',
	};
	return cfg;
};

exports.DepModule = DepModule;
