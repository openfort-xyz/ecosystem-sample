// ============================================
// app/components/actions/SignTypedDataAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { useSignTypedData, useAccount } from 'wagmi';
import { WalletActionCard } from '../WalletActionCard';

export function SignTypedDataAction() {
  const { address, chain } = useAccount();
  const { signTypedData, data: signature, isPending, error } = useSignTypedData();

  const handleSignTypedData = useCallback(() => {
    if (!address) return;

    const types = {
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'content', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    };

    signTypedData({
      domain: {
        chainId: chain?.id,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      } as const,
      types,
      message: {
        from: { name: 'Alice', wallet: '0x2111111111111111111111111111111111111111' },
        to: { name: 'Bob', wallet: '0x3111111111111111111111111111111111111111' },
        content: 'Hello!',
      },
      primaryType: 'Mail',
    });
  }, [signTypedData, chain, address]);

  // Only render when wallet is connected
  if (!address) return null;

  return (
    <WalletActionCard
      icon={MessageSquare}
      title="eth_signTypedData_v4"
      buttonText="Sign Typed Data"
      onClick={handleSignTypedData}
      isLoading={isPending}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={error}
      payload={signature}
    />
  );
}

