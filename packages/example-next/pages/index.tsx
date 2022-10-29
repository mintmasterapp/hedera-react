import Head from "next/head";
import { Connector, Actions } from "@hedera-react/types";
import { initializeConnector } from "@hedera-react/core";

export interface WalletConnectConstructorArgs {
  actions: Actions;
}

export class Empty extends Connector {
  provider: undefined;
  constructor({ actions }: WalletConnectConstructorArgs) {
    super(actions);
    console.log(this.actions);
  }
  public updateChainId() {
    this.actions.update({ chainId: 2 });
  }
  public activate() {
    void 0;
  }
}

export default function Home() {
  const [connector, hooks] = initializeConnector(
    (actions) => new Empty({ actions })
  );
  const chainId = hooks.useChainId();

  console.log(chainId);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button onClick={() => connector.updateChainId()}>Change</button>
    </div>
  );
}
