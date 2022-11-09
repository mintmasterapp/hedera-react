import type { Actions } from "@hedera-react/types";
import { Connector } from "@hedera-react/types";
import EventEmitter3 from "eventemitter3";
import {
  HashConnect as WHashConnect,
  HashConnectTypes,
  MessageTypes,
} from "hashconnect";

interface HashConnectArgs {
  actions: Actions;
  onError?: (error: Error) => void;
  appMetaData: HashConnectTypes.AppMetadata;
}

function parseChainId(chainId: string) {
  return chainId === "mainnet" ? 1 : 2;
}

export class HashConnect extends Connector {
  public provider?: WHashConnect;
  public readonly events = new EventEmitter3();
  public readonly appMetaData: HashConnectTypes.AppMetadata;
  private isFoundExtension: boolean;

  private eagerConnection?: Promise<void>;

  constructor({ actions, onError, appMetaData }: HashConnectArgs) {
    super(actions, onError);
    this.appMetaData = appMetaData;
    this.isFoundExtension = false;
  }

  private update = (state: MessageTypes.ApprovePairing): void => {
    console.log("hashconnect state change event", state);
    this.actions.update({ chainId: parseChainId(state.network) });
    this.actions.update({ accounts: state.accountIds });
  };

  private disconnect = (state: any): void => {
    console.log("hashconnect state change event", state);
    // this.actions.resetState();
  };

  public async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;
    return (this.eagerConnection = import("hashconnect").then(async (m) => {
      this.provider = new m.HashConnect() as unknown as WHashConnect;
      await this.provider.init(this.appMetaData, "mainnet");
      console.log(this.provider);
      this.provider.foundExtensionEvent.on((data) => {
        this.isFoundExtension = true;
      });
      this.provider.pairingEvent.on(this.update);
      this.provider.connectionStatusChangeEvent.on(this.disconnect);
    }));
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider?.hcData.topic) throw Error("No existing connection");
      const accounts = await this.provider?.hcData.pairingData[0].accountIds;
      if (!accounts.length) throw new Error("No accounts returned");
      const network = await this.provider?.hcData.pairingData[0].network;
      this.actions.update({ chainId: parseChainId(network), accounts });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(): Promise<void> {
    if (!this.isFoundExtension) {
      throw Error("Not found HashPack Extension");
    }
    if (
      this.provider?.hcData.pairingData &&
      this.provider?.hcData.pairingData.length > 0
    ) {
      throw Error("Already Connected");
    }

    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      this.provider?.connectToLocalWallet();
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async deactivate(): Promise<void> {
    this.provider?.pairingEvent.off(() => {});
    this.provider?.foundExtensionEvent.off(() => {});
    this.provider?.connectionStatusChangeEvent.off(() => {});
    this.provider?.disconnect(this.provider?.hcData.topic);
    this.provider = undefined;
    this.eagerConnection = undefined;
    this.actions.resetState();
  }
}
