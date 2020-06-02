const Proxy = require('./proxy');

module.exports = class extends Proxy {
	constructor() {
		super('npm');
	}

	async add(args) {
		await this.install(args);
	}

	async remove(args) {
		await this.exec(`${this._name} uninstall`, args);
	}
};
