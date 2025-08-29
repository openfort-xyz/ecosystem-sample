// ============================================
// app/components/actions/PersonalSignAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { Key } from 'lucide-react';
import { useSignMessage, useAccount } from 'wagmi';
import { WalletActionCard } from '../WalletActionCard';

export function PersonalSignAction() {
  const { address, chain } = useAccount();
  const { signMessage, data: signature, isPending, error } = useSignMessage();

  const handlePersonalSign = useCallback(() => {
    if (!address) return;
    signMessage({ message: 'Hello World' });
  }, [signMessage, address]);

  // Only render when wallet is connected
  if (!address) return null;

  return (
    <WalletActionCard
      title="personal_sign"
      buttonText="Sign Message"
      onClick={handlePersonalSign}
      isLoading={isPending}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={error}
      payload={signature}
    />
  );
}
