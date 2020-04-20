const Generator = require('../../src/abstractGenerator');
const { APP, APP_ENTRY, TS_CONFIG, BABEL_JS, SCRIPT_TYPES_JSON } = require('../../src/const');
const { getTempPath } = require('../../src/helper');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this._name = APP;

		this._buildDestOpt();

		this.option('scriptType', {
			type: String,
			default: 'js',
			desc: 'Script type, options:' + SCRIPT_TYPES_JSON,
		});
	}

	_getScriptCfg(opt) {
		const scriptType = opt.scriptType;
		const deps = [];
		let ext = '.js';
		let exclude = '';
		let cfgFile = '';
		let cfgName = '';
		let cmd = '';
		switch (scriptType) {
			case 'ts':
				deps.push('typescript');
				ext = '.ts';
				exclude = /^\./;
				cfgFile = TS_CONFIG;
				cfgName = 'typescript';
				cmd = 'tsc -p . --outDir dist';
				break;
			case 'es':
				deps.push('@babel/cli', '@babel/core', '@babel/preset-env');
				cfgFile = BABEL_JS;
				cfgName = 'babel';
				cmd = 'babel src -d dist --copy-files';
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

	_fillPkg(opt, pkg, devDep, script) {
		const cfg = this._getScriptCfg(opt);
		cfg.deps.length > 0 && devDep.apply(this, cfg.deps);
		if (cfg.cmd) {
			script('start', 'npm run build -- -w');
			script('build', cfg.cmd);
		}
	}

	_copyCfgByPkg(opt, pkg, copyCfg) {
		const cfg = this._getScriptCfg(opt);
		this.fs.copy(
			this.templatePath(getTempPath(this._name, APP_ENTRY)),
			this._destPath(APP_ENTRY + cfg.ext)
		);
		cfg.cfgFile && copyCfg(cfg.cfgName, [cfg.cfgFile], cfg.exclude);
	}

	writing() {
		this._writingByPkg();
	}
};
