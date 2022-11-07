import type { Actions, ProviderRpcError } from "@hedera-react/types";
import type { IClientMeta } from "@walletconnect/types";
import WalletConnect from "@walletconnect/client";
import { Connector } from "@hedera-react/types";
import EventEmitter3 from "eventemitter3";
import type { EventEmitter } from "node:events";

interface WalletConnectArgs {
  actions: Actions;
  clientMeta: IClientMeta;
  defaultChainId?: number;
  onError?: (error: Error) => void;
  timeout?: number;
}

const bridge = "https://bridge.walletconnect.org";

function parseChainId(chainId: string | number) {
  return typeof chainId === "string" ? Number.parseInt(chainId) : chainId;
}

export class FlashConnect extends Connector {
  public provider?: WalletConnect;
  public readonly events = new EventEmitter3();
  public readonly clientMeta: IClientMeta;
  private readonly defaultChainId: number;
  private readonly timeout: number;

  private eagerConnection?: Promise<void>;

  constructor({
    actions,
    clientMeta,
    onError,
    defaultChainId,
    timeout = 5000,
  }: WalletConnectArgs) {
    super(actions);
    const provider = new WalletConnect({
      bridge: bridge,
      clientMeta: clientMeta,
    });
    if (provider?.connected) {
      provider?.createSession({ chainId: defaultChainId });
    }
    this.onError = onError;
    this.clientMeta = clientMeta;
    this.provider = provider;
    this.defaultChainId = defaultChainId || 1;
    this.timeout = timeout;
  }

  private update = (error: any, payload: any): void => {
    if (error) {
      this.onError?.(error);
    }
    const { accounts, chainId } = payload.params[0];
    this.actions.update({ chainId: parseChainId(chainId) });
    this.actions.update({ accounts });
  };
  private disconnect = (error: any, payload: any): void => {
    if (error) {
      this.onError?.(error);
    }
    this.actions.resetState();
  };

  public async isomorphicInitialize(
    chainId = this.defaultChainId
  ): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import("@walletconnect/client").then(
      async (m) => {
        this.provider = new m.default({
          bridge,
          clientMeta: this.clientMeta,
        }) as unknown as WalletConnect;

        await this.provider.createSession({ chainId });

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
      this.actions.update({ chainId, accounts });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(desiredChainId?: number): Promise<void> {
    if (this.provider?.connected) {
      throw new Error("Already Connected");
    }
    const cancelActivation = this.actions.startActivation();

    if (desiredChainId && desiredChainId !== this.provider?.chainId)
      await this.deactivate();
    try {
      await this.isomorphicInitialize(desiredChainId);
      const accounts = this.provider?.accounts;
      const chainId = this.provider!.chainId;
      this.actions.update({ chainId, accounts });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async deactivate(): Promise<void> {
    this.provider?.off("connect");
    this.provider?.off("session_update");
    this.provider?.off("disconnect");
    await this.provider?.killSession();
    this.provider = undefined;
    this.eagerConnection = undefined;
    this.actions.resetState();
  }
}
