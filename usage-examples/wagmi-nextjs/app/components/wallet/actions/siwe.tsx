// ============================================
// app/components/actions/SIWEAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { Key } from 'lucide-react';
import { useSignMessage, useAccount } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';
import { baseSepolia } from 'wagmi/chains';
import { WalletActionCard } from '../WalletActionCard';

export function SIWEAction() {
  const { address, chainId, chain } = useAccount();
  const { signMessage, data: signature, isPending, error } = useSignMessage();

  const handleSIWE = useCallback(() => {
    if (!address) return;

    const siweMessage = createSiweMessage({
      domain: window.location.host,
      address: address,
      statement: 'Sign in with Ethereum',
      uri: window.location.origin,
      version: '1',
      chainId: chainId ?? baseSepolia.id,
      nonce: 'deadbeef',
    });
    
    signMessage({ message: siweMessage });
  }, [signMessage, chainId, address]);

  // Only render when wallet is connected
  if (!address) return null;

  return (
    <WalletActionCard
      title="Authentication"
      buttonText="Sign in with Ethereum"
      onClick={handleSIWE}
      isLoading={isPending}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={error}
      payload={signature}
    />
  );
}
