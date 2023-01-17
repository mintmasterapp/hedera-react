import { Connector, Actions, Network } from "@hedera-react/types";
import { BladeSigner, HederaNetwork } from "@bladelabs/blade-web3.js";

export interface BladeConstructorArgs {
  actions: Actions;
  onError?: (error: Error) => void;
  defaultNetwork?: Network;
  dAppCode?: string;
}

export class Blade extends Connector {
  public provider?: BladeSigner;

  private eagerConnection?: Promise<void>;
  private readonly defaultNetwork: Network;
  private readonly dAppCode: string | undefined;

  constructor({
    actions,
    onError,
    defaultNetwork,
    dAppCode,
  }: BladeConstructorArgs) {
    super(actions, onError);
    this.defaultNetwork = defaultNetwork || Network.HederaMainnet;
    this.dAppCode = dAppCode || undefined;
  }

  private async isomorphicInitialize(
    desiredNetwork = this.defaultNetwork
  ): Promise<void> {
    if (this.eagerConnection) return;
    return (this.eagerConnection = import("@bladelabs/blade-web3.js").then(
      async (m) => {
        this.provider = new m.default.BladeSigner();
        await this.provider.createSession({
          network:
            desiredNetwork === Network.HederaMainnet
              ? HederaNetwork.Mainnet
              : HederaNetwork.Testnet,
          dAppCode: this.dAppCode,
        });
      }
    ));
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw Error("No existing connection");
      const account = await this.provider?.getAccountId();
      if (!account) throw new Error("No accounts returned");
      const network = await this.provider?.getNetwork();
      console.log(network, account);
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(desiredNetwork?: Network): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize(desiredNetwork);
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }
  public async deactivate(): Promise<void> {
    this.provider?.killSession();
    this.provider = undefined;
    this.eagerConnection = undefined;
    this.actions.resetState();
  }
}
