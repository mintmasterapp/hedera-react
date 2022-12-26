import type { StoreApi } from "zustand";

export enum Network {
  HederaMainnet,
  HederaTestnet,
  Previewnet,
}

export interface HederaReactState {
  network: Network | undefined;
  accounts: string[] | undefined;
  activating: boolean;
}

export type HederaReactStore = StoreApi<HederaReactState>;

export type HederaReactStateUpdate =
  | {
      network: Network;
      accounts: string[];
    }
  | {
      network: Network;
      accounts?: never;
    }
  | {
      network?: never;
      accounts: string[];
    };

export interface Actions {
  startActivation: () => () => void;
  update: (stateUpdate: HederaReactStateUpdate) => void;
  resetState: () => void;
}

export interface Provider {}

export abstract class Connector {
  public provider?: Provider;
  protected readonly actions: Actions;
  protected onError?: (error: Error) => void;

  constructor(actions: Actions, onError?: (error: Error) => void) {
    this.actions = actions;
    this.onError = onError;
  }

  public resetState(): Promise<void> | void {
    this.actions.resetState();
  }

  public abstract activate(...args: unknown[]): Promise<unknown> | unknown;

  public connectEagerly?(...args: unknown[]): Promise<unknown> | unknown;

  public deactivate?(...args: unknown[]): Promise<unknown> | unknown;

  public sendTransaction?(...args: unknown[]): Promise<unknown> | unknown;

  public signMessage?(...args: unknown[]): Promise<unknown> | unknown;
}
