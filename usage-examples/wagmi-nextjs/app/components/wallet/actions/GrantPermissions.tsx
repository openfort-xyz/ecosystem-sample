
// ============================================
// app/components/actions/GrantPermissionsAction.tsx
// ============================================
"use client";

import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { BaseError, createWalletClient, custom } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { erc7715Actions } from 'viem/experimental';
import { WalletActionCard } from '../WalletActionCard';

export function GrantPermissionAction() {
  const { address, chain, connector } = useAccount();
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<BaseError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGrantPermissions = useCallback(async () => {
    if (!address || !connector) return;

    setIsLoading(true);
    setSessionError(null);

    try {
      const provider = await connector.getProvider();
      const privateKey = generatePrivateKey();
      const accountSession = privateKeyToAccount(privateKey).address;
      
      const walletClient = createWalletClient({
        chain: chain,
        transport: custom(provider as any),
      }).extend(erc7715Actions());

      await walletClient.grantPermissions({
        signer: {
          type: "key",
          data: { id: accountSession }
        },
        expiry: 60 * 60 * 24, // 24 hours
        permissions: [{
          type: 'contract-call',
          data: {
            address: '0x2522f4fc9af2e1954a3d13f7a5b2683a00a4543a',
            calls: []
          },
          policies: [{
            type: { custom: "usage-limit" },
            data: { limit: 10 }
          }]
        }],
      });

      setSessionKey(accountSession);
    } catch (e) {
      setSessionError(e as BaseError);
    } finally {
      setIsLoading(false);
    }
  }, [connector, chain, address]);

  // Only render when wallet is connected
  if (!address) return null;

  return (
    <WalletActionCard
      title="wallet_grantPermissions"
      buttonText="Grant Session Key"
      onClick={handleGrantPermissions}
      isLoading={isLoading}
      blockExplorerUrl={chain?.blockExplorers?.default.url || ''}
      error={sessionError}
      payload={!sessionError && sessionKey ? sessionKey : undefined}
    />
  );
}

