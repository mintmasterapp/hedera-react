import { useEffect, useState } from "react";
import { flashConnector, hooks } from "../connectors/flashConnector";
import Button from "./Button";

const { useAccount, useIsActive, useNetwork, useIsActivating } = hooks;

export default function FlashCard() {
  const active = useIsActive();
  const account = useAccount();
  const network = useNetwork();
  const activating = useIsActivating();

  console.log(active, account, network, activating);

  useEffect(() => {
    if (flashConnector.connectEagerly) {
      flashConnector.connectEagerly().catch(() => {
        console.debug("Failed to connect eagerly to walletconnect");
      });
    }
  }, []);

  const signMessage = (account: string, message: string) => {
    flashConnector
      .signMessage(account, message)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  };

  const sendHbar = (account: string, message: string) => {
    flashConnector
      .sendTransaction(account, Buffer.from(account))
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  };

  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-4xl font-semibold">Flash Wallet</p>
          <p className="text-white mt-2">Connect Hedera App without pain</p>
          {account && <p className="mt-2 text-green-500">account:{account}</p>}
          {network && <p className="mt-2 text-green-500">network:{network}</p>}
          <br />
          {active && account && (
            <div className="flex justify-start items-center gap-3">
              <Button
                name="Send Hbar"
                onClick={() =>
                  signMessage(account, "hello there please sign my message")
                }
              />
              <Button name="Sign Message" onClick={() => {}} />
            </div>
          )}
        </div>
        <Button
          name={active ? "Disconnect" : "Connect"}
          onClick={() => {
            if (active) {
              if (flashConnector?.deactivate) {
                void flashConnector.deactivate();
              } else {
                void flashConnector.resetState();
              }
            } else {
              flashConnector.activate().catch((err) => {
                console.log("err", err);
              });
            }
          }}
        />
      </div>
    </div>
  );
}
