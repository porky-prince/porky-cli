[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# porky-cli

> This is a scaffold

## Install

npm:

```sh
$ npm install -g porky-cli
```

yarn:

```sh
$ yarn add global porky-cli
```

## Usage

### Command line usage

First, you have to install the dependency package globally

```sh
$ porky [options]
```

example:

```sh
$ porky yo --myo
```

#### Command line options

```
Options:
  -V, --Version                  output the version number
  --log-level <level>            log4js log level, for more: https://github.com/log4js-node/log4js-node (default: "all")
  --clear                        whether to clear this time execute command generated by the temporary cache (default: false)
  -h, --help                     display help for command

Commands:
  init                           configure or reconfigure some init info
  add <plugins...>               add one or more plugins, it can be remote, local, or a js file
  remove [options] [plugins...]  remove one or more plugins, it can be remote, local, or a js file
  list [options]                 list available plugins
  run [options] <cmd>            run the command provided by the added plugin
  exec <cmds...>                 exec the command in the runtime directory
  yo [options]                   CLI tool for running Yeoman generators http://yeoman.io
  dvs [options]                  Synchronize and update the dependencies of the package.json to the installed version
  config <command>               Manages the .porkyrc.json configuration file.
  help [command]                 display help for command
```

[npm]: https://img.shields.io/npm/v/porky-cli.svg
[npm-url]: https://npmjs.com/package/porky-cli
[node]: https://img.shields.io/node/v/porky-cli.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=porky-cli
[size-url]: https://packagephobia.now.sh/result?p=porky-cli
