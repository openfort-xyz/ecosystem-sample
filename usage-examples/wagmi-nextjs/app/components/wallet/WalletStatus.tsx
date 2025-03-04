"use client";

import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi';
import { LogOut } from "lucide-react";
import { Button } from '../ui/button'; 
import { Card } from '../ui/card';
import { getExplorerUrl } from "@/lib/wallet";
import { WalletActionCard } from "./WalletActionCard";
import { useWalletActions } from './WalletActions';
import { useCallback } from 'react';

export function WalletStatus() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { actions } = useWalletActions();
  // const chainId = useChainId()
  // const { chains, switchChain, error } = useSwitchChain()

  const handleDisconnectWallet = useCallback(async() => {
    disconnect();
    const provider = await connector?.getProvider();
    (provider as any).disconnect(); // this is needed because wagmi isn't calling the providers disconnect method
    location.reload();
  }, [disconnect]);

  if (!address) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-4 md:p-6 bg-[#1A1A1A]/80 backdrop-blur-md border-gray-800">
        <div className="text-center space-2">
          <h2 className="text-lg md:text-xl font-semibold">Connected to Rapid Fire Wallet</h2>
          <p className="font-mono text-sm text-gray-400 break-all px-2">
            {address}
          </p>
          <a 
            href={getExplorerUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 hover:underline cursor-pointer inline-block text-sm md:text-sm"
          >
            View on Explorer
          </a>
          {/* <div className='flex space-x-2 my-2'>
            {chains.map((chain) => (
              <Button
                disabled={chainId === chain.id}
                key={chain.id}
                className="flex items-center justify-center gap-2 w-full md:w-auto border-gray-700 hover:bg-gray-800"
                onClick={() => switchChain({ chainId: chain.id })}
                variant="outline"
              >
                {chain.name}
              </Button>
            ))}

          </div> */}
          <Button
            variant="outline"
            onClick={() => handleDisconnectWallet()}
            className="flex items-center justify-center gap-2 w-full md:w-auto border-gray-700 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4" /> Disconnect
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <WalletActionCard
            key={action.title}
            {...action}
          />
        ))}
      </div>
    </div>
  );
}