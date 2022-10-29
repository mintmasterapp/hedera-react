import { initializeConnector } from "@hedera-react/core";
import { FlashWallet } from "@hedera-react/flash";

export const [walletConnect, hooks] = initializeConnector<FlashWallet>(
  (actions) =>
    new FlashWallet({
      actions,
      options: {
        rpc: [],
      },
    })
);
