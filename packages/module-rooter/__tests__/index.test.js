const path = require('path');
const ROOT = path.join(__dirname, '../node_modules');
const BASE = path.join(__dirname, '../../../node_modules');
const moduleRooter = require('../index')(require);

describe('test:module-rooter', () => {
	it('find module in closest node_modules', () => {
		const moduleRoot = path.join(ROOT, 'fs-extra');
		let rooter = moduleRooter('fs-extra');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(moduleRoot);
		expect(rooter.exist).toBe(true);
		expect(Boolean(rooter.error)).toBe(false);

		rooter = rooter('package.json');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(path.join(moduleRoot, 'package.json'));
		expect(rooter.exist).toBe(true);
		expect(Boolean(rooter.error)).toBe(false);

		rooter = rooter('lib', 'index.js');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(path.join(moduleRoot, 'lib', 'index.js'));
		expect(rooter.exist).toBe(true);
		expect(Boolean(rooter.error)).toBe(false);

		rooter = rooter('noExist', 'index.js');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(path.join(moduleRoot, 'noExist', 'index.js'));
		expect(rooter.exist).toBe(false);
		expect(Boolean(rooter.error)).toBe(false);
	});

	it('find module in parent node_modules', () => {
		const moduleRoot = path.join(BASE, 'lodash');
		const rooter = moduleRooter('lodash');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(moduleRoot);
		expect(rooter.exist).toBe(true);
		expect(Boolean(rooter.error)).toBe(false);
	});

	it('find scope module in parent node_modules', () => {
		const moduleRoot = path.join(BASE, '@jest/core');
		const rooter = moduleRooter('@jest/core');
		expect(rooter.root).toBe(moduleRoot);
		expect(rooter.cd).toBe(moduleRoot);
		expect(rooter.exist).toBe(true);
		expect(Boolean(rooter.error)).toBe(false);
	});

	it('Cannot find module', () => {
		const rooter = moduleRooter('@types/node');
		expect(rooter.root).toBe('');
		expect(rooter.cd).toBe('');
		expect(rooter.exist).toBe(false);
		expect(Boolean(rooter.error)).toBe(true);
	});
});
