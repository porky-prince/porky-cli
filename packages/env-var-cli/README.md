[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

# env-var-cli

> Declare the temporary of environment variable at the command line

## Install

npm:

```sh
$ npm install -g env-var-cli
```

yarn:

```sh
$ yarn global add env-var-cli
```

## Usage

dos:

```sh
$ env-var-cli config set npm_url https://registry.npmjs.org
$ env-var
$ echo %npm_url%
// => https://registry.npmjs.org
$ env-var-cli name var
$ var
$ echo %npm_url%
// => https://registry.npmjs.org
```

shell:

```sh
$ env-var-cli config set npm_url https://registry.npmjs.org
$ . env-var
$ echo $npm_url
// => https://registry.npmjs.org
$ env-var-cli name var
$ . var
$ echo $npm_url
// => https://registry.npmjs.org
```

[npm]: https://img.shields.io/npm/v/envVarCli.svg
[npm-url]: https://npmjs.com/package/env-var-cli
[node]: https://img.shields.io/node/v/envVarCli.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=envVarCli
[size-url]: https://packagephobia.now.sh/result?p=envVarCli
