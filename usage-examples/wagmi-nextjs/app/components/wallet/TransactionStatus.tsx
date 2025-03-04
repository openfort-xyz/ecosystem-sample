"use client";

import { truncateHash, getExplorerUrl } from "@/lib/wallet";

interface TransactionStatusProps {
  hash: string;
  status: 'pending' | 'success' | 'error';
}

export function TransactionStatus({ hash, status }: TransactionStatusProps) {
  if (!hash) return null;

  return (
    <div className="mt-4 text-center">
      <h3 className="text-sm font-medium mb-2">
        Transaction Status: {status}
      </h3>
      <a
        href={getExplorerUrl(hash, 'tx')}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-400 hover:text-orange-300 hover:underline text-sm font-mono"
      >
        {truncateHash(hash)}
      </a>
    </div>
  );
}