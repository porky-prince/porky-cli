const moduleRooter = require('module-rooter')(require);

module.exports = {
	getPkgRooter(pkg) {
		return moduleRooter(pkg);
	},
};
