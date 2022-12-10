import {
  Actions,
  HederaReactState,
  HederaReactStore,
  HederaReactStateUpdate,
} from "@hedera-react/types";
import { createStore } from "zustand";

function validateAccount(account: string): string {
  // FIXME: Validate Account
  return account;
}

const DEFAULT_STATE = {
  network: undefined,
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
    if (stateUpdate.accounts !== undefined) {
      for (let i = 0; i < stateUpdate.accounts.length; i++) {
        stateUpdate.accounts[i] = validateAccount(stateUpdate.accounts[i]);
      }
    }

    nullifier++;

    store.setState((existingState): HederaReactState => {
      // determine the next network and accounts
      const network = stateUpdate.network ?? existingState.network;
      const accounts = stateUpdate.accounts ?? existingState.accounts;

      // ensure that the activating flag is cleared when appropriate
      let activating = existingState.activating;
      if (activating && network && accounts) {
        activating = false;
      }

      return { network, accounts, activating };
    });
  }

  function resetState(): void {
    nullifier++;
    store.setState(DEFAULT_STATE);
  }

  return [store, { startActivation, update, resetState }];
}
