# hedera-react (beta)

_A simple, maximally extensible, dependency minimized framework for building modern [Hedera dApps](https://www.hedera.com/)_

## [Example](https://cra-hedera-react.vercel.app/)

This is a hosted version of [example](/example-next).

## Installation

```
npm install @hedera-react/types @hedera-react/core @hedera-react/store @hedera-react/flash @hedera-react/hashconnect @hedera-react/blade
```

OR

```
yarn add @hedera-react/types @hedera-react/core @hedera-react/store @hedera-react/flash @hedera-react/hashconnect @hedera-react/blade
```

## Packages

| Package                                             | Version                                                                                                                 | Size                                                                                                                                               | Link                                       |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`@hedera-react/types`](packages/types)             | [![npm](https://img.shields.io/npm/v/@hedera-react/types.svg)](https://www.npmjs.com/package/@hedera-react/types)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@hedera-react/types.svg)](https://bundlephobia.com/result?p=@web3-react/types@beta)          |                                            |
| [`@hedera-react/store`](packages/store)             | [![npm](https://img.shields.io/npm/v/@hedera-react/store.svg)](https://www.npmjs.com/package/@hedera-react/store)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@hedera-react/store.svg)](https://bundlephobia.com/result?p=@hedra-react/store)              |                                            |
| [`@web3-react/core`](packages/core)                 | [![npm](https://img.shields.io/npm/v/@web3-react/core/beta.svg)](https://www.npmjs.com/package/@web3-react/core/v/beta) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/core/beta.svg)](https://bundlephobia.com/result?p=@web3-react/core@beta)         |                                            |
| **Connectors**                                      |                                                                                                                         |                                                                                                                                                    |                                            |
| [`@hedera-react/flash`](packages/flash)             | [![npm](https://img.shields.io/npm/v/@hedera-react/flash.svg)](https://www.npmjs.com/package/@hedera-react/flash)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@hedera-react/flash.svg)](https://bundlephobia.com/result?p=@web3-react/eip1193@beta)        | [Flash Wallet](https://flashwallet.app)    |
| [`@hedera-react/hashconnect`](packages/hashconnect) | [![npm](https://img.shields.io/npm/v/@hedera-react/flash.svg)](https://www.npmjs.com/package/@hedera-react/hashconnect) | [![minzip](https://img.shields.io/bundlephobia/minzip/@hedera-react/hashconnect.svg)](https://bundlephobia.com/result?p=@hedera-react/hashconnect) | [Hashpack Wallet](https://hashpack.app)    |
| [`@hedera-react/blade`](packages/blade)             | [![npm](https://img.shields.io/npm/v/@hedera-react/blade.svg)](https://www.npmjs.com/package/@hedera-react/blade)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@hedera-react/blade.svg)](https://bundlephobia.com/result?p=@hedera-react/blade)             | [Blade Wallet](https://www.bladewallet.io) |

## Get Started

- `yarn`
- `yarn start`

In addition to compiling each package in watch mode, this will also spin up [packages/example-next](packages/example-next) on [localhost:3000](http://localhost:3000/). But this is just a skeleton app for testing compatibility.

## Run Tests

- `yarn build`
- `yarn test`

## Publish

- `yarn lerna publish`

## Documentation

This version of hedera-react is still in beta, so unfortunately documentation is pretty sparse at the moment. [packages/example-next](packages/example-next), TSDoc comments, and the source code itself are the best ways to get an idea of what's going on. More thorough documentation is a priority as development continues!
