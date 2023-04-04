# `@hedera-react/types`

### Network

- An enum that represents different network options, including `HederaMainnet`, `HederaTestnet`, and `Previewnet`.

### HederaReactState

- An interface that defines the shape of the state object for the HederaReactStore.
- It has the following properties:
  - `network`: A property of type `Network` or `undefined`.
  - `accounts`: An array of strings or `undefined`.
  - `activating`: A boolean indicating if activation is currently in progress.

### HederaReactStore

- A type alias that uses the `StoreApi` from the `"zustand"` library to define the state and actions available in the store.
- The store's state will be of type `HederaReactState`.

### HederaReactStateUpdate

- A union type that specifies valid updates to the `HederaReactState` object.
- It has three possible shapes:
  - `{ network: Network; accounts: string[]; }`
  - `{ network: Network; accounts?: never; }`
  - `{ network?: never; accounts: string[]; }`

### Actions

- An interface that defines several action functions that can be used to update the state of the `HederaReactStore`.
- It has the following methods:
  - `startActivation`: A function that returns another function which can be called to cancel the activation process.
  - `update`: A function that takes a `HederaReactStateUpdate` object and updates the state of the store accordingly.
  - `resetState`: A function that resets the state of the store.

### Provider

- An empty interface that serves as a placeholder for a provider object used by the `Connector` class.

### Connector

- An abstract class that defines the base functionality for a connector object used to connect to different networks.
- It has the following properties:
  - `provider`: An optional property of type `Provider`.
  - `actions`: An instance of the `Actions` interface used to update the state of the `HederaReactStore`.
  - `onError`: An optional callback function that handles errors thrown during connection or activation.
- It has the following methods:
  - `resetState()`: A method that resets the state of the store.
  - `activate()`: An abstract method that attempts to activate a connector instance for a network.
  - `connectEagerly()`: An optional method that connects eagerly to a network.
  - `deactivate()`: An optional method that deactivates a connector instance from a network.
  - `sendTransaction()`: An optional method that sends a transaction to a network.
  - `signMessage()`: An optional method that signs a message for a transaction on a network.
  - `signTransaction()`: An optional method that signs a transaction on a network.

Note: This Types Documentation was generated for the code block provided using TypeScript syntax.
