[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# module-rooter

> Get the resolved path to the root of a package installed in node_modules and find some files

## Install

npm:

```sh
$ npm install --save module-rooter
```

yarn:

```sh
$ yarn add module-rooter
```

## Usage

```sh
/
└── Users
    └── admin
        └── project
            ├── index.js
            ├── package.json
            └── node_modules
                ├── @user
                    └── module1
                        ├── index.js
                        ├── package.json
                        └── node_modules
                ├── module2
                   ├── src
                        └── index.js
                   ├── package.json
                   └── node_modules
                └── module3
```

### Using in code

```js
const moduleRooter = require('module-rooter')(require);

let rooter = moduleRooter('@user/module1');
console.log(rooter.root);
//=> '/Users/admin/project/node_modules/@user/module1'
console.log(rooter('index.js').cd);
//=> '/Users/admin/project/node_modules/@user/module1/index.js'

rooter = moduleRooter('module2', 'package.json');
console.log(rooter.root);
//=> '/Users/admin/project/node_modules/module2'
console.log(rooter.cd);
//=> '/Users/admin/project/node_modules/module2/package.json'

rooter = rooter('src', 'index.js');
console.log(rooter.cd);
//=> '/Users/admin/project/node_modules/module2/src/index.js'
console.log(rooter.exist);
//=> true
console.log(rooter.error);
//=> ''

rooter = rooter('src', 'other.js');
console.log(rooter.cd);
//=> '/Users/admin/project/node_modules/module2/src/other.js'
console.log(rooter.exist);
//=> false
console.log(rooter.error);
//=> ''

rooter = moduleRooter('module4');
console.log(rooter.error);
//=> MODULE_NOT_FOUND
```

[npm]: https://img.shields.io/npm/v/moduleRooter.svg
[npm-url]: https://npmjs.com/package/module-rooter
[node]: https://img.shields.io/node/v/moduleRooter.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=moduleRooter
[size-url]: https://packagephobia.now.sh/result?p=moduleRooter
