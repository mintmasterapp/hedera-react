import { useEffect, useState } from "react";

import { hashConnector, hooks } from "../connectors/hashConnector";
import Button from "./Button";

const { useAccount, useIsActive, useChainId } = hooks;

export default function HashPackCard() {
  const active = useIsActive();
  const account = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    if (hashConnector.connectEagerly) {
      hashConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to walletconnect");
      });
    }
  }, []);
  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-4xl font-semibold">HashPack Wallet</p>
          <p className="text-white mt-2">Connect Hedera App without pain</p>
          {account && <p className="mt-2 text-green-500">account:{account}</p>}
          {chainId && <p className="mt-2 text-green-500">chainId:{chainId}</p>}
        </div>
        <Button
          name={active ? "Disconnect" : "Connect"}
          onClick={() => {
            if (active) {
              if (hashConnector?.deactivate) {
                void hashConnector.deactivate();
              } else {
                void hashConnector.resetState();
              }
            } else {
              hashConnector.activate().catch((err) => {
                console.log("err", err);
              });
            }
          }}
        />
      </div>
    </div>
  );
}
