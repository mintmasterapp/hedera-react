export interface Account {
  accountId: string;
  solidityAddress: string;
}

export interface AbstractConnectorArguments {
  supportedNetworkIds?: number[];
}

export interface ConnectorUpdate<T = number> {
  provider?: any;
  networkId?: T;
  account?: null | Account;
}

// eslint-disable-next-line no-shadow
export enum ConnectorEvent {
  Update = "HederaReactUpdate",
  Error = "HederaReactError",
  Deactivate = "HederaReactDeactivate",
}
