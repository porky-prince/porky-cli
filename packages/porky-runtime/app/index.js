const Generator = require('yeoman-generator');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.option('generateInto', {
			type: String,
			defaults: '',
			desc: 'Relocate the location of the generated files.',
		});
	}

	initializing() {}

	prompting() {}

	writing() {
		const opts = this.options;
		this.fs.writeJSON(this.destinationPath(opts.generateInto, 'package.json'), {
			name: 'porky-runtime',
			version: '0.0.0',
			private: true,
			main: 'index.js',
		});
	}
};
