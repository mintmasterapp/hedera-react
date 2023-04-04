# `@hedera-react/store`

## createHederaReactStoreAndActions() function

The `createHederaReactStoreAndActions()` function exports two things: a store object and an actions object. This function uses the `zustand` library to create a store with default state and returns both the store and actions objects.

### Import Statements

This code block imports the following from '@hedera-react/types':

- Actions
- HederaReactState
- HederaReactStore
- HederaReactStateUpdate

It also imports the following from 'zustand':

- createStore

Lastly, it imports the Network enumeration from '@hedera-react/types'

### Default State

The `DEFAULT_STATE` constant defines the default state of the store. The default state contains:

- network: undefined
- accounts: undefined
- activating: false

### createHederaReactStoreAndActions() Function

This function creates a store by calling `createStore<HederaReactState>()`, which takes in `HederaReactState` as generic type interface and returns a store instance with default state `DEFAULT_STATE`. The store instance is stored in the `store` variable.

The `nullifier` variable is used to ensure that activation can be cancelled and will not run if another activation has taken place before it.

The `startActivation()` function is defined inside this function, which updates the store's state setting activating flag to true. It then returns a function that cancels the activation if it's the last one called.

The `update()` function is also defined here, which accepts a state update object of type `HederaReactStateUpdate`. Inside this function, the `nullifier` variable is incremented to track the number of activations so far. Using the previous state and the state update passed in, the next state of the store is calculated. `activating` flag is cleared when appropriate based on the network availability, and the final state object is returned.

The `resetState()` function is defined to set the store's state back to the default state.

Finally, this function returns an array that contains the store and actions objects respectively.

Example Usage:

```
import { createHederaReactStoreAndActions } from "@hedera-react/types";

const [store, actions] = createHederaReactStoreAndActions();

actions.startActivation(); // Activates the store.
actions.resetState(); // Resets the store to default state.
actions.update({network: "HederaMainnet", accounts: [], activating: false}); // Updates the store with new state.
```
