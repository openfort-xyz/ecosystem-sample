// ============================================
// app/components/actions/BatchTransactionsAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { useWriteContracts } from 'wagmi/experimental';
import { useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { WalletActionCard } from '../WalletActionCard';

export function BatchTransactionsAction() {
  const { chain } = useAccount();
  const { data: bundleIdentifier, isPending, error, writeContracts } = useWriteContracts();

  const handleSendBatch = useCallback(() => {
    writeContracts({
      contracts: [
        {
          address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
          abi: parseAbi(['function mint(uint256)']),
          functionName: 'mint',
          args: [1000000000000000000],
        },
        {
          address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
          abi: parseAbi(['function transfer(address,uint256) returns (bool)']),
          functionName: 'transfer',
          args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B',10000000000000000],
        },
      ],
    });
  }, [writeContracts]);

  return (
    <WalletActionCard
      title="wallet_sendCalls"
      buttonText="Send Batch Transaction"
      onClick={handleSendBatch}
      isLoading={isPending}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={error}
      hash={bundleIdentifier?.id as `0x${string}` | undefined}
    />
  );
}