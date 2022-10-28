import type { hethers } from "@hashgraph/hethers";
import type { Connector, HederaReactStore } from "@hedera-react/types";
import type { Context, MutableRefObject, ReactNode } from "react";
import React, { createContext, useContext, useRef } from "react";
import type { HederaReactHooks, HederaReactPriorityHooks } from "./hooks";
import { getPriorityConnector } from "./hooks";

export type HederaContextType<
  T extends hethers.providers.BaseProvider = hethers.providers.HederaProvider
> = {
  connector: Connector;
  chainId: ReturnType<HederaReactPriorityHooks["useSelectedChainId"]>;
  accounts: ReturnType<HederaReactPriorityHooks["useSelectedAccounts"]>;
  isActivating: ReturnType<HederaReactPriorityHooks["useSelectedIsActivating"]>;
  account: ReturnType<HederaReactPriorityHooks["useSelectedAccount"]>;
  isActive: ReturnType<HederaReactPriorityHooks["useSelectedIsActive"]>;
  provider: T | undefined;
  hooks: ReturnType<typeof getPriorityConnector>;
};

const HederaContext = createContext<HederaContextType | undefined>(undefined);

export interface HederaReactProviderProps {
  children: ReactNode;
  connectors:
    | [Connector, HederaReactHooks][]
    | [Connector, HederaReactHooks, HederaReactStore][];
  connectorOverride?: Connector;
  network?: hethers.providers.Networkish;
}

export function HederaReactProvider({
  children,
  connectors,
  connectorOverride,
  network,
}: HederaReactProviderProps) {
  const cachedConnectors: MutableRefObject<
    HederaReactProviderProps["connectors"]
  > = useRef(connectors);

  if (
    connectors.length != cachedConnectors.current.length ||
    connectors.some((connector, i) => {
      const cachedConnector = cachedConnectors.current[i];
      return connector[0] !== cachedConnector[0];
    })
  )
    throw new Error(
      "The connectors prop passed to Web3ReactProvider must be referentially static. If connectors is changing, try providing a key prop to Web3ReactProvider that changes every time connectors changes."
    );

  const hooks = getPriorityConnector(...connectors);
  const {
    usePriorityConnector,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  } = hooks;

  const priorityConnector = usePriorityConnector();
  const connector = connectorOverride ?? priorityConnector;

  const chainId = useSelectedChainId(connector);
  const accounts = useSelectedAccounts(connector);
  const isActivating = useSelectedIsActivating(connector);
  const account = useSelectedAccount(connector);
  const isActive = useSelectedIsActive(connector);

  const provider = useSelectedProvider(connector, network);

  return (
    <HederaContext.Provider
      value={{
        connector,
        chainId,
        accounts,
        isActivating,
        account,
        isActive,
        provider,
        hooks,
      }}
    >
      {children}
    </HederaContext.Provider>
  );
}

export function useWeb3React<
  T extends hethers.providers.BaseProvider = hethers.providers.HederaProvider
>(): HederaContextType<T> {
  const context = useContext(
    HederaContext as Context<HederaContextType<T> | undefined>
  );
  if (!context)
    throw Error(
      "useWeb3React can only be used within the Web3ReactProvider component"
    );
  return context;
}
