import { useEffect, useState } from "react";
import {
  AccountId,
  TransactionId,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";
import { bladeConnector, hooks } from "../connectors/bladeConnector";
import Button from "./Button";

const { useAccount, useIsActive, useNetwork, useIsActivating } = hooks;

export const makeTransBytes = async (trans: any, accountId: string) => {
  const transId = TransactionId.generate(accountId);
  trans.setTransactionId(transId);
  trans.setNodeAccountIds([new AccountId(3)]);
  await trans.freeze();
  return Buffer.from(trans.toBytes());
};

export default function FlashCard() {
  const active = useIsActive();
  const account = useAccount();
  const network = useNetwork();
  const activating = useIsActivating();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bladeConnector.connectEagerly) {
      bladeConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to walletconnect");
      });
    }
  }, []);

  const signMessage = (account: string, message: string) => {
    setLoading(true);
    bladeConnector
      .signMessage(account, message)
      .then((result: any) => {
        setResult(result);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
      });
  };

  const sendHbar = async () => {
    if (!account) return;
    const currentAccount = AccountId.fromSolidityAddress(account);
    const transaction = new TransferTransaction()
      .addHbarTransfer(currentAccount, new Hbar(-1))
      .addHbarTransfer("0.0.1234", new Hbar(1));

    const makeBytes = await makeTransBytes(
      transaction,
      currentAccount.toString()
    );

    bladeConnector
      .sendTransaction(account, makeBytes)
      .then((result: any) => {
        setResult(result);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
      });
  };

  const connect = () => {
    if (active) {
      if (bladeConnector?.deactivate) {
        void bladeConnector.deactivate();
      } else {
        void bladeConnector.resetState();
      }
    } else {
      bladeConnector.activate().catch((err: any) => {
        console.log("err", err);
      });
    }
  };

  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center flex-wrap">
        <div className="w-full mb-10">
          <p className="text-white text-4xl font-semibold">Flash Wallet</p>
          {account && (
            <p className="mt-2 text-green-500">
              account:{AccountId.fromSolidityAddress(account).toString()}
            </p>
          )}
          {network && <p className="mt-2 text-green-500">network:{network}</p>}
          <br />
          {active && account && (
            <div className="flex justify-start items-center gap-3">
              <Button
                name="Sign Message"
                onClick={() =>
                  signMessage(account, "hello there! Sign message please")
                }
                loading={loading}
                disabled={loading}
              />
              <Button
                name="Sign Message"
                onClick={sendHbar}
                loading={loading}
                disabled={loading}
              />
            </div>
          )}

          {result && (
            <p className="mt-10 text-white max-w-full">
              Result: {JSON.stringify(result)}
            </p>
          )}
        </div>
        <Button
          name={active ? "Disconnect" : "Connect"}
          onClick={connect}
          loading={activating}
          disabled={activating}
        />
      </div>
    </div>
  );
}
