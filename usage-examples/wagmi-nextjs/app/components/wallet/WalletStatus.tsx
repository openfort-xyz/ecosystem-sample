"use client";

import { useAccount } from 'wagmi';
import { WalletActionCard } from "./WalletActionCard";
import { useWalletActions } from './WalletActions';

export function WalletStatus() {
  const { address } = useAccount();
  const { actions } = useWalletActions();

  if (!address) return null;

  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
        {actions.map((action) => (
          <div key={action.title}>
            <WalletActionCard
              {...action}
            />
          </div>
        ))}
      </div>
    </div>
  );
}