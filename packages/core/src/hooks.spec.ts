import type { Actions } from "@hedera-react/types";
import { Network } from "@hedera-react/types";
import { Connector } from "@hedera-react/types";
import EventEmitter from "events";
import { act, renderHook } from "@testing-library/react-hooks";
import type { HederaReactHooks } from "./hooks";
import { initializeConnector } from "./hooks";

class MockProvider extends EventEmitter {
  signTransaction = jest.fn();
  signMessage = jest.fn();
}

class MockConnector extends Connector {
  provider = new MockProvider();

  constructor(actions: Actions) {
    super(actions);
  }
  public activate() {
    this.actions.startActivation();
  }
  public update(...args: Parameters<Actions["update"]>) {
    this.actions.update(...args);
  }
}

class MockConnector2 extends MockConnector {}

describe("#initializeConnector", () => {
  let connector: MockConnector;
  let hooks: HederaReactHooks;

  beforeEach(() => {
    [connector, hooks] = initializeConnector(
      (actions) => new MockConnector(actions)
    );
  });

  test("#useChainId", () => {
    const { result } = renderHook(() => hooks.useNetwork());
    expect(result.current).toBe(undefined);
    act(() => connector.update({ network: Network.HederaMainnet }));
    expect(result.current).toBe(Network.HederaMainnet);
  });

  describe("#useAccounts", () => {
    test("empty", () => {
      const { result } = renderHook(() => hooks.useAccounts());
      expect(result.current).toBe(undefined);

      act(() => connector.update({ accounts: [] }));
      expect(result.current).toEqual([]);
    });
  });

  test("single", () => {
    const { result } = renderHook(() => hooks.useAccounts());
    expect(result.current).toBe(undefined);
    act(() => connector.update({ accounts: ["0.0.1234"] }));
    expect(result.current).toEqual(["0.0.1234"]);
  });

  test("multiple", () => {
    const { result } = renderHook(() => hooks.useAccounts());
    expect(result.current).toBe(undefined);
    act(() =>
      connector.update({
        accounts: ["0.0.12345", "0.043242"],
      })
    );
    expect(result.current).toEqual(["0.0.12345", "0.043242"]);
  });

  test("#useIsActivating", () => {
    const { result } = renderHook(() => hooks.useIsActivating());
    expect(result.current).toBe(false);

    act(() => connector.activate());
    expect(result.current).toEqual(true);
  });

  test("#useIsActive", () => {
    const { result } = renderHook(() => hooks.useIsActive());
    expect(result.current).toBe(false);
    act(() =>
      connector.update({ network: Network.HederaMainnet, accounts: [] })
    );
    expect(result.current).toEqual(true);
  });

  describe("#useProvider", () => {
    test("lazy loads Provider and rerenders", async () => {
      act(() =>
        connector.update({ network: Network.HederaMainnet, accounts: [] })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        hooks.useProvider()
      );
      // expect(result.current).toBeUndefined();
      // await waitForNextUpdate();
      // expect(result.current).toBeInstanceOf(undefined);
    });
  });
});
