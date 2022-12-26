import { useEffect } from "react";
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

  const connect = async () => {
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
  };

  return (
    <div className="py-8 bg-black rounded-2xl my-5 px-8">
      <div className="flex justify-between items-center flex-wrap">
        <div className="w-full mb-10">
          <p className="text-white text-3xl font-semibold">HashPack Wallet</p>
          {account && <p className="mt-2 text-green-500">account:{account}</p>}
          {network && <p className="mt-2 text-green-500">network:{network}</p>}
        </div>

        <Button
          name={active ? "Disconnect" : "Connect"}
          disabled={activating}
          onClick={connect}
          loading={activating}
        />
      </div>
    </div>
  );
}
