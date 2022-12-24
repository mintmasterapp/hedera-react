import type { Actions } from "@hedera-react/types";
import { Connector, Network } from "@hedera-react/types";
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
  defaultNetwork: Network;
}

enum HashConnectConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

function parseNetwork(network: string) {
  if (network === "mainnet") {
    return Network.HederaMainnet;
  }
  if (network === "testnet") {
    return Network.HederaTestnet;
  }
  return undefined;
}

function parseHashConnectNetwork(network: Network) {
  if (network === Network.HederaMainnet) {
    return "mainnet";
  }
  if (network === Network.HederaTestnet) {
    return "testnet";
  }
  return "previewnet";
}

export class HashConnect extends Connector {
  public provider?: WHashConnect;
  public readonly events = new EventEmitter3();
  public readonly appMetaData: HashConnectTypes.AppMetadata;
  private isFoundExtension: boolean;
  private readonly defaultNetwork: Network;

  private eagerConnection?: Promise<void>;

  constructor({
    actions,
    onError,
    appMetaData,
    defaultNetwork,
  }: HashConnectArgs) {
    super(actions, onError);
    this.appMetaData = appMetaData;
    this.isFoundExtension = false;
    this.defaultNetwork = defaultNetwork || Network.HederaMainnet;
  }

  private update = (state: MessageTypes.ApprovePairing): void => {
    this.actions.update({
      network: parseNetwork(state.network),
      accounts: state.accountIds,
    });
  };

  private changeState = (state: HashConnectConnectionState): void => {
    if (state === HashConnectConnectionState.Disconnected) {
      this.actions.resetState();
    }
  };

  public async isomorphicInitialize(
    desiredNetwork = this.defaultNetwork
  ): Promise<void> {
    if (this.eagerConnection) return;
    return (this.eagerConnection = import("hashconnect").then(async (m) => {
      this.provider = new m.HashConnect() as unknown as WHashConnect;
      const net = parseHashConnectNetwork(desiredNetwork);
      await this.provider.init(this.appMetaData, net);
      this.provider.foundExtensionEvent.on((data) => {
        this.isFoundExtension = true;
      });
      this.provider.pairingEvent.on(this.update);
      this.provider.connectionStatusChangeEvent.on(this.changeState);
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
      this.actions.update({
        network: parseNetwork(network),
        accounts: accounts,
      });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(desiredNetwork?: Network): Promise<void> {
    if (
      this.provider?.hcData.pairingData &&
      this.provider?.hcData.pairingData.length > 0
    ) {
      throw Error("Already Connected");
    }

    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize(desiredNetwork);
      if (!this.isFoundExtension) {
        throw Error("Not found HashPack Extension");
      }
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

  public async sendTransaction(
    account: string,
    transaction: Buffer
  ): Promise<unknown> {
    if (!this.provider) return;
    const request = {
      topic: this.provider?.hcData.topic,
      byteArray: transaction,
      metadata: {
        accountToSign: account,
        returnTransaction: true,
        hideNft: false,
      },
    };
    const res = await this.provider?.sendTransaction(request.topic, request);
    return res;
  }

  public async signMessage(account: string, message: string): Promise<unknown> {
    return "Not Implemented yet";
  }
}
