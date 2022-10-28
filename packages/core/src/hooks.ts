import type { hethers } from "@hashgraph/hethers";
import { createHederaReactStoreAndActions } from "@hedera-react/store";
import type {
  Actions,
  Connector,
  HederaReactStore,
  HederaReactState,
} from "@hedera-react/types";
import { useEffect, useMemo, useState } from "react";
import type { UseBoundStore } from "zustand";
import create from "zustand";

let DynamicProvider: hethers.providers.Provider | null | undefined;

async function importProvider(): Promise<void> {
  if (DynamicProvider === undefined) {
    try {
      const { getDefaultProvider } = await import("@hashgraph/hethers");

      DynamicProvider = getDefaultProvider();
    } catch {
      console.debug("@hashgraph/hethers not available");
      DynamicProvider = null;
    }
  }
}

export type HederaReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>;

export type HederaReactSelectedHooks = ReturnType<typeof getSelectedConnector>;

export type HederaReactPriorityHooks = ReturnType<typeof getPriorityConnector>;

export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T
): [T, HederaReactHooks, HederaReactStore] {
  const [store, actions] = createHederaReactStoreAndActions();

  const connector = f(actions);
  const useConnector = create(store);

  const stateHooks = getStateHooks(useConnector);
  const derivedHooks = getDerivedHooks(stateHooks);
  const augmentedHooks = getAugmentedHooks<T>(
    connector,
    stateHooks,
    derivedHooks
  );

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

function computeIsActive({ chainId, accounts, activating }: HederaReactState) {
  return Boolean(chainId && accounts && !activating);
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

  function useSelectedChainId(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useChainId }]) =>
      useChainId()
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

  function useSelectedProvider<
    T extends hethers.providers.BaseProvider = hethers.providers.HederaProvider
  >(
    connector: Connector,
    network?: hethers.providers.Networkish
  ): T | undefined {
    const index = getIndex(connector);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useProvider }], i) =>
      useProvider<T>(network, i === index)
    );
    return values[index];
  }

  return {
    useSelectedStore,
    useSelectedChainId,
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
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  } = getSelectedConnector(...initializedConnectors);

  function usePriorityConnector() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActive }]) =>
      useIsActive()
    );
    const index = values.findIndex((isActive) => isActive);
    return initializedConnectors[index === -1 ? 0 : index][0];
  }

  function usePriorityStore() {
    return useSelectedStore(usePriorityConnector());
  }

  function usePriorityChainId() {
    return useSelectedChainId(usePriorityConnector());
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

  function usePriorityProvider<
    T extends hethers.providers.BaseProvider = hethers.providers.HederaProvider
  >(network?: hethers.providers.Networkish) {
    return useSelectedProvider<T>(usePriorityConnector(), network);
  }

  return {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    usePriorityConnector,
    usePriorityStore,
    usePriorityChainId,
    usePriorityAccounts,
    usePriorityIsActivating,
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
  };
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
  function useProvider<
    T extends hethers.providers.BaseProvider = hethers.providers.HederaProvider
  >(network?: hethers.providers.Networkish, enabled = true): T | undefined {
    const isActive = useIsActive();
    const chainId = useChainId();

    // ensure that Provider is going to be available when loaded if @ethersproject/providers is installed
    const [loaded, setLoaded] = useState(DynamicProvider !== undefined);
    useEffect(() => {
      if (loaded) return;
      let stale = false;
      void importProvider().then(() => {
        if (stale) return;
        setLoaded(true);
      });
      return () => {
        stale = true;
      };
    }, [loaded]);

    return useMemo(() => {
      // to ensure connectors remain fresh, we condition re-renders on loaded, isActive and chainId
      void loaded && isActive && chainId;
      if (enabled) {
        if (connector.customProvider) return connector.customProvider as T;
        else if (DynamicProvider && connector.provider)
          return connector.provider as unknown as T;
      }
    }, [loaded, enabled, isActive, chainId, network]);
  }

  return { useProvider };
}
