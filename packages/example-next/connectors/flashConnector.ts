import { initializeConnector } from "@hedera-react/core";
import { FlashConnect } from "../flash";

export const [flashConnector, hooks] = initializeConnector(
  (actions) =>
    new FlashConnect({
      actions,
      clientMeta: {
        description: "Flash Wallet Demo",
        url: "https://flash-demo.vercel.app",
        icons: ["https://mintmaster.s3.us-east-1.amazonaws.com/flash.png"],
        name: "Flash Demo",
      },
    }) as any
);
