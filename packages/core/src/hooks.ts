import { createHederaReactStoreAndActions } from "@hedera-react/store";
import {
  Actions,
  Connector,
  HederaReactStore,
  HederaReactState,
  Network,
  Provider,
} from "@hedera-react/types";
import { useMemo } from "react";
import type { UseBoundStore } from "zustand";
import create from "zustand";

export type HederaReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>;

export type HederaReactPriorityHooks = ReturnType<typeof getPriorityConnector>;

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

const NETWORK_ID = ({ network }: HederaReactState) => network;
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
  function useNetwork(): HederaReactState["network"] {
    return useConnector(NETWORK_ID);
  }

  function useAccounts(): HederaReactState["accounts"] {
    return useConnector(ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER);
  }

  function useIsActivating(): HederaReactState["activating"] {
    return useConnector(ACTIVATING);
  }

  return { useNetwork, useAccounts, useIsActivating };
}

function computeIsActive({ network, accounts, activating }: HederaReactState) {
  const isNetworkAvailable =
    network === Network.HederaMainnet || network === Network.HederaTestnet;
  return Boolean(isNetworkAvailable && accounts && !activating);
}

function getDerivedHooks({
  useNetwork,
  useAccounts,
  useIsActivating,
}: ReturnType<typeof getStateHooks>) {
  function useAccount(): string | undefined {
    return useAccounts()?.[0];
  }

  function useIsActive(): boolean {
    const network = useNetwork();
    const accounts = useAccounts();
    const activating = useIsActivating();

    return computeIsActive({
      network,
      accounts,
      activating,
    });
  }

  return { useAccount, useIsActive };
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useNetwork }: ReturnType<typeof getStateHooks>,
  { useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  function useProvider<T extends Provider>(enable = true): T | undefined {
    const isActive = useIsActive();
    const network = useNetwork();

    return useMemo(() => {
      void enable && isActive && network;
      return connector.provider as unknown as T;
    }, [isActive, network]);
  }

  return { useProvider };
}

export function getSelectedConnector(
  ...initializedConnectors:
    | [Connector, HederaReactHooks][]
    | [Connector, HederaReactHooks, HederaReactStore][]
) {
  function getIndex(connector: Connector) {
    const index = initializedConnectors.findIndex(
      ([initializedConnector]) => connector === initializedConnector
    );
    if (index === -1) throw new Error("Connector not found");
    return index;
  }

  function useSelectedStore(connector: Connector) {
    const store = initializedConnectors[getIndex(connector)][2];
    if (!store) throw new Error("Stores not passed");
    return store;
  }

  function useSelectedNetwork(connector: Connector) {
    const values = initializedConnectors.map(([, { useNetwork }]) =>
      useNetwork()
    );
    return values[getIndex(connector)];
  }

  function useSelectedAccounts(connector: Connector) {
    const values = initializedConnectors.map(([, { useAccounts }]) =>
      useAccounts()
    );
    return values[getIndex(connector)];
  }

  function useSelectedIsActivating(connector: Connector) {
    const values = initializedConnectors.map(([, { useIsActivating }]) =>
      useIsActivating()
    );
    return values[getIndex(connector)];
  }

  function useSelectedAccount(connector: Connector) {
    const values = initializedConnectors.map(([, { useAccount }]) =>
      useAccount()
    );
    return values[getIndex(connector)];
  }

  function useSelectedIsActive(connector: Connector) {
    const values = initializedConnectors.map(([, { useIsActive }]) =>
      useIsActive()
    );
    return values[getIndex(connector)];
  }

  function useSelectedProvider<T extends Provider>(
    connector: Connector
  ): T | undefined {
    const index = getIndex(connector);
    const values = initializedConnectors.map(([, { useProvider }], i) =>
      useProvider<T>(index === i)
    );
    return values[index];
  }

  return {
    useSelectedStore,
    useSelectedNetwork,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  };
}

export function getPriorityConnector(
  ...initializedConnectors:
    | [Connector, HederaReactHooks][]
    | [Connector, HederaReactHooks, HederaReactStore][]
) {
  const {
    useSelectedStore,
    useSelectedNetwork,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  } = getSelectedConnector(...initializedConnectors);

  function usePriorityConnector() {
    const values = initializedConnectors.map(([, { useIsActive }]) =>
      useIsActive()
    );
    const index = values.findIndex((isActive) => isActive);
    return initializedConnectors[index === -1 ? 0 : index][0];
  }

  function usePriorityStore() {
    return useSelectedStore(usePriorityConnector());
  }

  function usePriorityNetwork() {
    return useSelectedNetwork(usePriorityConnector());
  }

  function usePriorityAccounts() {
    return useSelectedAccounts(usePriorityConnector());
  }

  function usePriorityIsActivating() {
    return useSelectedIsActivating(usePriorityConnector());
  }

  function usePriorityAccount() {
    return useSelectedAccount(usePriorityConnector());
  }

  function usePriorityIsActive() {
    return useSelectedIsActive(usePriorityConnector());
  }

  function usePriorityProvider() {
    return useSelectedProvider(usePriorityConnector());
  }

  return {
    useSelectedStore,
    useSelectedNetwork,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    usePriorityConnector,
    usePriorityStore,
    usePriorityNetwork,
    usePriorityAccounts,
    usePriorityIsActivating,
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
  };
}
