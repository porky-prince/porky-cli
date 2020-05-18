[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# dependency-version-sync

> Synchronize and update the dependencies of the package.json to the installed version

## Install

npm:

```sh
$ npm install -g dependency-version-sync
```

yarn:

```sh
$ yarn add global dependency-version-sync
```

## Usage

### Using in code

#### Using es5 in node

```js
const dvs = require('dependency-version-sync');

dvs(opts);
```

#### Using es6 or typescript in node

```js
import dvs from 'dependency-version-sync';

dvs(opts);
```

### Command line usage

First, you have to install the dependency package globally

```sh
$ dvs [options]
```

example:

```sh
$ dvs -m yarn -pre dev -f "^@babel.+" -i
```

#### Command line options

```
Options:
  -v, --version                output the version number
  -c, --cwd <path>             used as current working directory for `exec` in npm listing
  -m, --packageManager <name>  npm or yarn (default: "npm")
  -p, --pre <pre>              select a package.json dependencies prop, option:["","dev","optional"], default all dependencies props
  -f, --filter <package>       RegExp or String, filter specified packages
  -i, --install                whether to execute `npm install` for synchronization
  -h, --help                   display help for command
```

[npm]: https://img.shields.io/npm/v/dependency-version-sync.svg
[npm-url]: https://npmjs.com/package/dependency-version-sync
[node]: https://img.shields.io/node/v/dependency-version-sync.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=dependency-version-sync
[size-url]: https://packagephobia.now.sh/result?p=dependency-version-sync
