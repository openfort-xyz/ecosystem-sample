
// ============================================
// app/components/actions/SendTransactionAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { WalletActionCard } from '../WalletActionCard';
import { erc20Abi } from "@/app/utils/abi";

export function SendTransactionAction() {
  const { address, chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleMintUSDC = useCallback(() => {
    if (!address) return;

    writeContract({
      abi: erc20Abi,
      address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
      functionName: 'mint',
      args: [1000000000000000000],
    });
  }, [writeContract, address]);

  // Only render when wallet is connected
  if (!address) return null;

  return (
    <WalletActionCard
      title="eth_sendTransaction"
      buttonText="Mint 1 USDC"
      onClick={handleMintUSDC}
      isLoading={isPending}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={error}
      hash={hash}
      isConfirming={isConfirming}
      isConfirmed={isConfirmed}
    />
  );
}
