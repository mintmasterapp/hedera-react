import { initializeConnector } from "@hedera-react/core";
import { Blade } from "@hedera-react/blade";

export const [bladeConnector, hooks] = initializeConnector<Blade>(
  (actions) =>
    new Blade({
      actions,
    })
);
