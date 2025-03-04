"use client";

import { RapidFireLogo } from "../ui/rapid-fire-logo";
import { Button } from "../ui/button";
import { WalletStatus } from "./WalletStatus";
import { useAccount, useConnect } from "wagmi";
import { useCallback, useEffect } from "react";
import { ecosystemWalletInstance } from "@/app/utils/ecosystemWallet";

export function WalletConnect() {
  useEffect(() => {
  ecosystemWalletInstance.getEthereumProvider({
    policy: process.env.NEXT_PUBLIC_POLICY_ID,
  });
}, []);
  const { isConnected } = useAccount();
  const { connectors, connect, error } = useConnect();
  const connectWallet = useCallback(() => {
    const injectedConnector = connectors.find(
      (connector) => connector.id === 'com.rapidfire.id'
    );
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connectors, connect]);
  if (!isConnected) {
    return (
      <>
      <Button
        onClick={connectWallet}
        className="mx-auto flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
      >
        <RapidFireLogo className="w-4 h-4" /> Sign in with Rapidfire ID
      </Button>

      <div className='flex justify-center items-center'>
      <p className="text-xs m-2 text-red-300">{error?.message}</p>
      </div>
      </>
    );
  }

  return <WalletStatus />;
}