import { initializeConnector } from "@hedera-react/core";
import { HashConnect } from "../hashpack";

export const [hashConnector, hooks] = initializeConnector<HashConnect>(
  (actions) =>
    new HashConnect({
      actions,
      appMetaData: {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg",
      },
    })
);
