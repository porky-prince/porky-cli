const AbstractGenerator = require('../../src/abstractGenerator');
const { getTempPath } = require('../../src/helper');
const { DepModule, depConfig } = require('../../src/depModule');
const { MAIN, MAIN_ENTRY, TS_CONFIG, BABEL_JS, SCRIPT_TYPES_JSON } = require('../../src/const');
const configs = depConfig({
	scriptType: {
		type: String,
		default: 'js',
		desc: 'Script type, options:' + SCRIPT_TYPES_JSON,
	},
});

module.exports = class extends AbstractGenerator {
	constructor(args, opts) {
		super(args, opts, MAIN);
	}

	_getScriptCfg(opts) {
		const scriptType = opts.scriptType;
		const deps = [];
		let ext = '.js';
		let exclude = '';
		let cfgFile = '';
		let cfgName = '';
		let cmd = '';
		switch (scriptType) {
			case 'ts':
				deps.push(new DepModule('typescript', '^3.9.6'));
				ext = '.ts';
				exclude = /^\./;
				cfgFile = TS_CONFIG;
				cfgName = 'typescript';
				cmd = 'tsc -p . --outDir dist';
				break;
			case 'es':
				deps.push(
					new DepModule('@babel/cli', '^7.8.4'),
					new DepModule('@babel/core', '^7.9.0'),
					new DepModule('@babel/preset-env', '^7.9.0')
				);
				cfgFile = BABEL_JS;
				cfgName = 'babel';
				cmd = 'babel src -d dist --copy-files';
				break;
			default:
				break;
		}

		return {
			deps,
			ext,
			exclude,
			cfgFile,
			cfgName,
			cmd,
		};
	}

	_fillPkg(opts, pkg, devDep, script) {
		const cfg = this._getScriptCfg(opts);
		cfg.deps.length > 0 && devDep.apply(this, cfg.deps);
		if (cfg.cmd) {
			script('start', 'npm run build -- -w');
			script('build', cfg.cmd);
		}
	}

	_copyTempByPkg(opts, pkg, copyTemp) {
		const cfg = this._getScriptCfg(opts);
		this.fs.copy(
			this.templatePath(getTempPath(this._name, MAIN_ENTRY)),
			this._destPath(MAIN_ENTRY + cfg.ext)
		);
		cfg.cfgFile && copyTemp(cfg.cfgName, [cfg.cfgFile], cfg.exclude);
	}

	writing() {
		return this._writingByPkg();
	}
};

module.exports.configs = configs;
