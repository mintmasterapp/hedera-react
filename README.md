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

Following steps are required to integrate flash wallet to your dapp. 

# Create a connector file

```

import { initializeConnector } from "@hedera-react/core";
import { FlashConnect } from "@hedera-react/flash";

export const [flashConnector, hooks] = initializeConnector<FlashConnect>(
  (actions) =>
    new FlashConnect({
      actions,
      clientMeta: {
        description: "Flash Wallet Demo",
        url: "https://flash-demo.vercel.app",
        icons: ["https://mintmaster.s3.us-east-1.amazonaws.com/flash.png"],
        name: "Flash Demo",
      },
    })
);

```

# Usage

Call the flashConnector from connector file in the useEffect of the component

```
import { flashConnector } from '../../connectors/flashConnector';

  useEffect(() => {
    if (flashConnector.connectEagerly) {
      flashConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to walletconnect");
      });
    }
  }, []);
  

```

Activating the wallet

```
  <WalletBtn
    onClick={() => {
        flashConnector.activate().catch((err: any) => {
          console.log('err', err);
        });
    }}
  />

```

Disconnecting from the wallet

```
<button onClick={() => flashConnector.deactivate()}>Logout</button>
```

Fetching active state and account

```
import { hooks } from '../../connectors/flashConnector';
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
