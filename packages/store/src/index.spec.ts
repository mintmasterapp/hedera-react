import { createHederaReactStoreAndActions } from ".";
import { Network } from "@hedera-react/types";

describe("#createHederaReactStoreAndActions", () => {
  test("uninitialized", () => {
    const [store] = createHederaReactStoreAndActions();
    expect(store.getState()).toEqual({
      network: undefined,
      accounts: undefined,
      activating: false,
      error: undefined,
    });
  });

  describe("#startActivation", () => {
    test("works", () => {
      const [store, actions] = createHederaReactStoreAndActions();
      actions.startActivation();
      expect(store.getState()).toEqual({
        network: undefined,
        accounts: undefined,
        activating: true,
        error: undefined,
      });
    });
    test("cancellation works", () => {
      const [store, actions] = createHederaReactStoreAndActions();
      const cancelActivation = actions.startActivation();

      cancelActivation();

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
        error: undefined,
      });
    });
  });

  describe("#update", () => {
    test("network", () => {
      const [store, actions] = createHederaReactStoreAndActions();
      const network = Network.HederaMainnet;
      actions.update({ network });
      expect(store.getState()).toEqual({
        network,
        accounts: undefined,
        activating: false,
        error: undefined,
      });
    });
    test("accounts", () => {
      const [store, actions] = createHederaReactStoreAndActions();
      const accounts = ["0.0.1234"];
      actions.update({ accounts });
      expect(store.getState()).toEqual({
        network: undefined,
        accounts: accounts,
        activating: false,
        error: undefined,
      });
    });
  });
});
