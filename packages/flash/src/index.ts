import { Actions, Network } from "@hedera-react/types";
import type { IClientMeta } from "@walletconnect/types";
import WalletConnect from "@walletconnect/client";
import { Connector } from "@hedera-react/types";
import EventEmitter3 from "eventemitter3";
import qrcodeModal from "./modal";

interface WalletConnectArgs {
  actions: Actions;
  clientMeta: IClientMeta;
  defaultNetwork?: Network;
  onError?: (error: Error) => void;
  enableQRModal?: boolean;
}

const bridge = "https://bridge.walletconnect.org";

export const URI_AVAILABLE = "URI_AVAILABLE";

function parseChainId(chainId: string | number) {
  return typeof chainId === "string" ? Number.parseInt(chainId) : chainId;
}

function parseNetwork(chainId: string | number) {
  const chain = parseChainId(chainId);
  if (chain === 1) {
    return Network.HederaMainnet;
  }
  if (chain === 2) {
    return Network.HederaTestnet;
  }
  return undefined;
}

export class FlashConnect extends Connector {
  public provider?: WalletConnect;
  public readonly events = new EventEmitter3();
  public readonly clientMeta: IClientMeta;
  private readonly defaultNetwork: Network;
  private readonly enableQRModal: boolean;

  private eagerConnection?: Promise<void>;

  constructor({
    actions,
    clientMeta,
    onError,
    defaultNetwork,
    enableQRModal,
  }: WalletConnectArgs) {
    super(actions, onError);
    this.clientMeta = clientMeta;
    this.defaultNetwork = defaultNetwork || Network.HederaMainnet;
    this.enableQRModal = enableQRModal || true;
  }

  private update = (error: any, payload: any): void => {
    if (error) {
      this.onError?.(error);
    }
    const { accounts, chainId } = payload.params[0];
    const network = parseNetwork(chainId);
    this.actions.update({ network, accounts });
    qrcodeModal.close();
  };

  private disconnect = (error: any, payload: any): void => {
    if (error) {
      this.onError?.(error);
    }
    this.actions.resetState();
  };

  private URIListener = (uri: string): void => {
    this.events.emit(URI_AVAILABLE, uri);
  };

  public async isomorphicInitialize(
    network = this.defaultNetwork
  ): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import("@walletconnect/client").then(
      async (m) => {
        this.provider = new m.default({
          bridge,
          clientMeta: this.clientMeta,
        }) as unknown as WalletConnect;
        if (!this.provider.connected) {
          await this.provider.createSession({
            chainId: network === Network.HederaMainnet ? 1 : 2,
          });
          this.URIListener(this.provider.uri);
        }
        this.provider.on("connect", this.update);
        this.provider.on("session_update", this.update);
        this.provider.on("disconnect", this.disconnect);
      }
    ));
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider?.connected) throw Error("No existing connection");
      const accounts = await this.provider?.accounts;
      if (!accounts.length) throw new Error("No accounts returned");
      const chainId = await this.provider.chainId;
      this.actions.update({
        network: parseNetwork(chainId),
        accounts,
      });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(desiredNetwork?: Network): Promise<void> {
    if (this.provider?.connected) {
      throw Error("Already Connected");
    }
    const cancelActivation = this.actions.startActivation();

    if (
      desiredNetwork &&
      this.provider?.chainId &&
      desiredNetwork !== parseNetwork(this.provider?.chainId)
    )
      await this.deactivate();

    try {
      await this.isomorphicInitialize(desiredNetwork);
      if (this.provider && this.enableQRModal) {
        qrcodeModal.open(this.provider.uri, async () => {
          await this.deactivate();
        });
      }
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async deactivate(): Promise<void> {
    this.provider?.off("connect");
    this.provider?.off("session_update");
    this.provider?.off("disconnect");
    if (this.provider?.connected) {
      await this.provider?.killSession();
    }
    this.provider = undefined;
    this.eagerConnection = undefined;
    this.actions.resetState();
  }

  public async sendTransaction(
    account: string,
    transaction: Buffer
  ): Promise<unknown> {
    const request = {
      id: Math.random() * (2000 - 500) + 500,
      jsonrpc: "2.0",
      method: "hedera_sendTransaction",
      params: [
        {
          from: account,
          data: transaction.toString("hex"),
        },
      ],
    };
    const data = await this.provider?.sendCustomRequest(request);
    return data;
  }

  public async signMessage(account: string, message: string): Promise<unknown> {
    const request = {
      id: Math.random() * (2000 - 500) + 500,
      jsonrpc: "2.0",
      method: "hedera_signMessage",
      params: [
        {
          from: account,
          data: message,
        },
      ],
    };
    const data = await this.provider?.sendCustomRequest(request);
    return data;
  }
}
