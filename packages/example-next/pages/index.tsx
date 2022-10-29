import Head from "next/head";
import { hooks, walletConnect } from "../connectors/flashWallet";
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } =
  hooks;

export default function Home() {
  // const chainId = useChainId();
  // const accounts = useAccounts();
  // const isActivating = useIsActivating();

  // const isActive = useIsActive();

  // const provider = useProvider();
  // console.log(chainId, accounts, isActivating, isActive, provider);
  console.log(hooks);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </div>
  );
}
