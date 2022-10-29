import {
  Actions,
  HederaReactState,
  HederaReactStore,
  HederaReactStateUpdate,
} from "@hedera-react/types";
import { createStore } from "zustand";

export const MAX_SAFE_CHAIN_ID = 2;

function validateChainId(chainId: number): void {
  if (
    !Number.isInteger(chainId) ||
    chainId <= 0 ||
    chainId > MAX_SAFE_CHAIN_ID
  ) {
    throw new Error(`Invalid chainId ${chainId}`);
  }
}

function validateAccount(account: string): string {
  // FIXME: Validate Account
  return account;
}

const DEFAULT_STATE = {
  chainId: undefined,
  accounts: undefined,
  activating: false,
};

export function createHederaReactStoreAndActions(): [
  HederaReactStore,
  Actions
] {
  const store = createStore<HederaReactState>()(() => DEFAULT_STATE);

  let nullifier = 0;

  function startActivation(): () => void {
    const nullifierCached = ++nullifier;

    store.setState({ ...DEFAULT_STATE, activating: true });

    // return a function that cancels the activation iff nothing else has happened
    return () => {
      if (nullifier === nullifierCached) store.setState({ activating: false });
    };
  }

  function update(stateUpdate: HederaReactStateUpdate): void {
    // validate chainId statically, independent of existing state
    if (stateUpdate.chainId !== undefined) {
      validateChainId(stateUpdate.chainId);
    }

    // validate accounts statically, independent of existing state
    if (stateUpdate.accounts !== undefined) {
      for (let i = 0; i < stateUpdate.accounts.length; i++) {
        stateUpdate.accounts[i] = validateAccount(stateUpdate.accounts[i]);
      }
    }

    nullifier++;

    store.setState((existingState): HederaReactState => {
      // determine the next chainId and accounts
      const chainId = stateUpdate.chainId ?? existingState.chainId;
      const accounts = stateUpdate.accounts ?? existingState.accounts;

      // ensure that the activating flag is cleared when appropriate
      let activating = existingState.activating;
      if (activating && chainId && accounts) {
        activating = false;
      }

      return { chainId, accounts, activating };
    });
  }

  function resetState(): void {
    nullifier++;
    store.setState(DEFAULT_STATE);
  }

  return [store, { startActivation, update, resetState }];
}
