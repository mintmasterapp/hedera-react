# `hedera-react` 🧰

_A simple, maximally extensible, dependency minimized framework for building modern [Hedera dApps](https://www.hedera.com/)_

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

| 🏠 **Core**
| `@hedera-react/core`

| 🔌 **Connectors**
`@hedera-react/flash`

## Installation

```
yarn add @hedera-react/core @hedera-react/flash @hedera-react/hashconnect @hedera-react/store 

```

## Initialisation

# Create a connector file

```

import { initializeConnector } from '@hedera-react/core';
import { HashConnect } from '@hedera-react/hashconnect';

export const [hashConnector, hooks] = initializeConnector<any>(
  (actions) =>
    new HashConnect({
      actions,
      appMetaData: {
        name: 'Project Name',
        description: 'Description',
        icon: 'https://www.hashpack.app/img/logo.svg',
      },
    }),
);

```

# Usage

Call the hashConnector from connector file in the useEffect of the component

```
import { hashConnector } from '../../connectors/hashConnector';

  useEffect(() => {
    if (hashConnector.connectEagerly) {
      hashConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to walletconnect");
      });
    }
  }, []);
  

```

Activating the wallet

```
  <WalletBtn
    onClick={() => {
        hashConnector.activate().catch((err: any) => {
          console.log('err', err);
        });
    }}
  />

```

Disconnecting from the wallet

```
<button onClick={() => hashConnector.deactivate()}>Logout</button>
```

Fetching active state and account

```
import { hooks } from '../../connectors/hashConnector';
const { useAccount, useIsActive, chainId, useIsActivating } = hooks;
const active = useIsActive();
const account = useAccount();
const activating = useIsActivating();


// Use as

 {account && <p className="mt-2 text-green-500">account:{account}</p>}
 {chainId && <p className="mt-2 text-green-500">chainId:{chainId}</p>}
 {activating && <p className="mt-2 text-yellow-500">Connecting...</p>}

```



## Local Development

- Clone repo\
  `git clone https://github.com/mintmasterapp/hedera-react.git`

- Install top-level dependencies\
  `yarn`

- Install sub-dependencies\
  `yarn bootstrap`

- Build and watch for changes\
  `yarn start`
