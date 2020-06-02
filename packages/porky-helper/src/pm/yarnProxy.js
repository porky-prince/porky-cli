const Proxy = require('./proxy');

module.exports = class extends Proxy {
	constructor() {
		super('yarn');
	}

	async add(args) {
		await this.exec(`${this._name} add`, args);
	}

	async remove(args) {
		await this.exec(`${this._name} remove`, args);
	}
};
