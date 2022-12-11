import type { Actions } from "@hedera-react/types";
import { Connector, Network } from "@hedera-react/types";
import EventEmitter from "events";
import { act, renderHook } from "@testing-library/react-hooks";

import type { HederaReactHooks, HederaReactPriorityHooks } from "./hooks";
import { initializeConnector, getPriorityConnector } from "./hooks";

class MockProvider extends EventEmitter {
  request = jest.fn();
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
    expect(result.current).toBe(1);
  });

  describe("#useAccounts", () => {
    test("empty", () => {
      const { result } = renderHook(() => hooks.useAccounts());
      expect(result.current).toBe(undefined);
      act(() => connector.update({ accounts: [] }));
      expect(result.current).toEqual([]);
    });

    test("single", () => {
      const { result } = renderHook(() => hooks.useAccounts());
      expect(result.current).toBe(undefined);

      act(() =>
        connector.update({
          accounts: ["0x0000000000000000000000000000000000000001"],
        })
      );
      expect(result.current).toEqual([
        "0x0000000000000000000000000000000000000001",
      ]);
    });

    test("multiple", () => {
      const { result } = renderHook(() => hooks.useAccounts());
      expect(result.current).toBe(undefined);

      act(() =>
        connector.update({
          accounts: [
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000001",
          ],
        })
      );
      expect(result.current).toEqual([
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000001",
      ]);
    });
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
    test("lazy loads HederaProvider and rerenders", async () => {
      act(() =>
        connector.update({ network: Network.HederaMainnet, accounts: [] })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        hooks.useProvider(false)
      );
      expect(result.current).toBeUndefined();
      await waitForNextUpdate();
      expect(result.current).toBeInstanceOf(MockProvider);
    });
  });
});

describe("#getSelectedConnector", () => {
  let connector: MockConnector;
  let hooks: HederaReactHooks;

  let connector2: MockConnector;
  let hooks2: HederaReactHooks;

  beforeEach(() => {
    [connector, hooks] = initializeConnector(
      (actions) => new MockConnector(actions)
    );
    [connector2, hooks2] = initializeConnector(
      (actions) => new MockConnector2(actions)
    );
  });
});

describe("#getPriorityConnector", () => {
  let connector: MockConnector;
  let hooks: HederaReactHooks;

  let connector2: MockConnector;
  let hooks2: HederaReactHooks;

  let priorityConnectorHooks: HederaReactPriorityHooks;

  beforeEach(() => {
    [connector, hooks] = initializeConnector(
      (actions) => new MockConnector(actions)
    );
    [connector2, hooks2] = initializeConnector(
      (actions) => new MockConnector2(actions)
    );

    priorityConnectorHooks = getPriorityConnector(
      [connector, hooks],
      [connector2, hooks2]
    );
  });

  test("returns first connector if both are uninitialized", () => {
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector());

    expect(priorityConnector).toBeInstanceOf(MockConnector);
    expect(priorityConnector).not.toBeInstanceOf(MockConnector2);
  });

  test("returns first connector if it is initialized", () => {
    act(() =>
      connector.update({ network: Network.HederaMainnet, accounts: [] })
    );
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector());

    const {
      result: { current: isActive },
    } = renderHook(() => priorityConnectorHooks.usePriorityIsActive());
    expect(isActive).toBe(true);

    expect(priorityConnector).toBeInstanceOf(MockConnector);
    expect(priorityConnector).not.toBeInstanceOf(MockConnector2);
  });

  test("returns second connector if it is initialized", () => {
    act(() =>
      connector2.update({ network: Network.HederaMainnet, accounts: [] })
    );
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector());

    const {
      result: { current: isActive },
    } = renderHook(() => priorityConnectorHooks.usePriorityIsActive());
    expect(isActive).toBe(true);

    expect(priorityConnector).toBeInstanceOf(MockConnector2);
  });
});
