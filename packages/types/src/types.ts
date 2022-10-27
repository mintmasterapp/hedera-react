import type { EventEmitter } from 'node:events'
import type { StoreApi } from 'zustand'

export interface HederaReactState {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
}

export type HederaReactStore = StoreApi<HederaReactState>

export type HederaReactStateUpdate =
  | {
      chainId: number
      accounts: string[]
    }
  | {
      chainId: number
      accounts?: never
    }
  | {
      chainId?: never
      accounts: string[]
    }

export interface Actions {
      startActivation: () => () => void
      update: (stateUpdate: HederaReactStateUpdate) => void
      resetState: () => void
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>
}

export interface ProviderConnectInfo {
  readonly chainId: string
}

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export abstract class Connector {
  public provider?: Provider
  public customProvider?: unknown
  protected readonly actions: Actions
  protected onError?: (error: Error) => void

  constructor(actions: Actions, onError?: (error: Error) => void) {
    this.actions = actions
    this.onError = onError
  }


  public resetState(): Promise<void> | void {
    this.actions.resetState()
  }

  public abstract activate(...args: unknown[]): Promise<void> | void

  public connectEagerly?(...args: unknown[]): Promise<void> | void

  public deactivate?(...args: unknown[]): Promise<void> | void

}
