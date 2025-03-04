// Shared types for wallet-related functionality
export type TransactionStatus = 'pending' | 'success' | 'error';

export interface Transaction {
  hash: string;
  status: TransactionStatus;
}

export interface WalletAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  buttonText: string;
  onClick: () => Promise<void>;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
}