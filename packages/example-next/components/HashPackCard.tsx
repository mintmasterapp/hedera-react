import { useEffect, useState } from "react";
import {
  TransactionId,
  AccountId,
  AccountAllowanceApproveTransaction,
  NftId,
  TokenId,
} from "@hashgraph/sdk";
import { hashConnector, hooks } from "../connectors/hashConnector";
import Button from "./Button";

const { useAccount, useIsActive, useNetwork, useIsActivating } = hooks;

export default function HashPackCard() {
  const active = useIsActive();
  const account = useAccount();
  const network = useNetwork();
  const activating = useIsActivating();

  useEffect(() => {
    if (hashConnector.connectEagerly) {
      hashConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to hash connect");
      });
    }
  }, []);

  const makeTransBytes = async (trans: any, accountId: string) => {
    const transId = TransactionId.generate(accountId);
    trans.setTransactionId(transId);
    trans.setNodeAccountIds([new AccountId(3)]);
    await trans.freeze();
    return Buffer.from(trans.toBytes());
  };

  const sendHbar = async () => {
    if (!account) return;
    const tokenId = TokenId.fromString("0.0.855050");
    const nftId = new NftId(tokenId, 1);
    const trans =
      new AccountAllowanceApproveTransaction().approveTokenNftAllowance(
        nftId,
        account,
        "0.0.1493811"
      );
    const transactions = await makeTransBytes(trans, account);
    console.log(transactions);
    hashConnector
      .sendTransaction(account, transactions)
      .then((result: any) => console.log(result))
      .catch((err: any) => console.log(err));
  };

  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-4xl font-semibold">HashPack Wallet</p>
          <p className="text-white mt-2">Connect Hedera App without pain</p>
          {account && <p className="mt-2 text-green-500">account:{account}</p>}
          {network && <p className="mt-2 text-green-500">network:{network}</p>}
          <Button name="boom" onClick={sendHbar} />
        </div>
        <Button
          name={active ? "Disconnect" : "Connect"}
          disabled={false}
          onClick={() => {
            if (active) {
              if (hashConnector?.deactivate) {
                void hashConnector.deactivate();
              } else {
                void hashConnector.resetState();
              }
            } else {
              hashConnector.activate().catch((err: any) => {
                console.log("err", err);
              });
            }
          }}
        />
      </div>
    </div>
  );
}
