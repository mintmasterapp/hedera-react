import { initializeConnector } from "@hedera-react/core";
import { Actions, Connector } from "@hedera-react/types";

interface EmptyConnectorArgs {
  actions: Actions;
}

class Empty extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: undefined;

  /**
   * No-op. May be called if it simplifies application code.
   */

  constructor({ actions }: EmptyConnectorArgs) {
    super(actions);
  }

  public activate() {
    void 0;
  }
}

export const [emptyConnector, hooks] = initializeConnector(
  (actions) => new Empty({ actions })
);
