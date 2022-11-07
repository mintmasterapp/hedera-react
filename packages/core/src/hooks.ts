import { createHederaReactStoreAndActions } from "@hedera-react/store";
import type {
  Actions,
  Connector,
  HederaReactStore,
  HederaReactState,
} from "@hedera-react/types";
import { useMemo } from "react";
import type { UseBoundStore } from "zustand";
import create from "zustand";

export type HederaReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>;

export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T
): [T, HederaReactHooks, HederaReactStore] {
  const [store, actions] = createHederaReactStoreAndActions();

  const connector = f(actions);
  const useConnector = create(store);

  const stateHooks = getStateHooks(useConnector);
  const derivedHooks = getDerivedHooks(stateHooks);
  const augmentedHooks = getAugmentedHooks(connector, stateHooks, derivedHooks);

  return [
    connector,
    {
      ...stateHooks,
      ...derivedHooks,
      ...augmentedHooks,
    },
    store,
  ];
}

const CHAIN_ID = ({ chainId }: HederaReactState) => chainId;
const ACCOUNTS = ({ accounts }: HederaReactState) => accounts;

const ACCOUNTS_EQUALITY_CHECKER = (
  oldAccounts: HederaReactState["accounts"],
  newAccounts: HederaReactState["accounts"]
) =>
  (oldAccounts === undefined && newAccounts === undefined) ||
  (oldAccounts !== undefined &&
    oldAccounts.length === newAccounts?.length &&
    oldAccounts.every((oldAccount, i) => oldAccount === newAccounts[i]));

const ACTIVATING = ({ activating }: HederaReactState) => activating;

function getStateHooks(useConnector: UseBoundStore<HederaReactStore>) {
  function useChainId(): HederaReactState["chainId"] {
    return useConnector(CHAIN_ID);
  }

  function useAccounts(): HederaReactState["accounts"] {
    return useConnector(ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER);
  }

  function useIsActivating(): HederaReactState["activating"] {
    return useConnector(ACTIVATING);
  }

  return { useChainId, useAccounts, useIsActivating };
}

function computeIsActive({ chainId, accounts, activating }: HederaReactState) {
  return Boolean(chainId && accounts && !activating);
}

function getDerivedHooks({
  useChainId,
  useAccounts,
  useIsActivating,
}: ReturnType<typeof getStateHooks>) {
  function useAccount(): string | undefined {
    return useAccounts()?.[0];
  }

  function useIsActive(): boolean {
    const chainId = useChainId();
    const accounts = useAccounts();
    const activating = useIsActivating();

    return computeIsActive({
      chainId,
      accounts,
      activating,
    });
  }

  return { useAccount, useIsActive };
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useChainId }: ReturnType<typeof getStateHooks>,
  { useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  function useProvider<T>(): T | undefined {
    const isActive = useIsActive();
    const chainId = useChainId();

    return useMemo(() => {
      void isActive && chainId;
      return connector.provider as unknown as T;
    }, [isActive, chainId]);
  }

  return { useProvider };
}
