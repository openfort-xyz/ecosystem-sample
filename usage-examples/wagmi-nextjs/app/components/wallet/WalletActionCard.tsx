"use client";

import { BaseError } from 'wagmi';
import { Button } from '../ui/button';
import { TransactionStatus } from "./TransactionStatus";
import { LucideIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';

interface WalletActionCardProps {
  icon: LucideIcon;
  title: string;
  buttonText: string;
  blockExplorerUrl: string;
  isLoading?: boolean;
  error?: Error | null;
  hash?: `0x${string}`;
  payload?: string;
  input?: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  onClick: (id?: string) => void;
  description?: string;
  customTitle?: string;
}

export function WalletActionCard({
  icon: Icon,
  buttonText,
  isLoading,
  blockExplorerUrl,
  error,
  hash,
  input,
  payload,
  isConfirmed,
  onClick
}: WalletActionCardProps) {
  const [inputValue, setInputValue] = useState('');
  
  let status: 'pending' | 'success' | 'error' = 'pending';
  if (isConfirmed) status = 'success';
  if (error) status = 'error';

  return (
    <div className="space-y-3">
      {input && (
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600">Amount</label>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0x.."
            className="border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-sm"
          />
        </div>
      )}
      
      <Button
        onClick={() => onClick(inputValue)}
        disabled={isLoading}
        className="w-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 active:from-blue-600 active:via-blue-700 active:to-blue-800 text-white rounded-lg shadow-lg border border-blue-400 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium py-5 transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Icon className="w-4 h-4" />
        {isLoading ? 'Processing...' : buttonText}
      </Button>
      
      {error && (
        <p className="text-xs text-red-500">
          {(error as BaseError).details || error.message}
        </p>
      )}
      
      {hash && (
        <TransactionStatus 
          hash={hash}
          blockExplorerUrl={blockExplorerUrl}
          status={status}
        />
      )}
      
      {payload && (
        <div className="text-nowrap overflow-x-auto text-xs text-gray-600 p-2 bg-blue-50 rounded-lg border border-blue-100">
          {payload}
        </div>
      )}
    </div>
  );
}

