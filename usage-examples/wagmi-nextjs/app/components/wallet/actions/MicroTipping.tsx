// ============================================
// app/components/actions/MicroTippingAction.tsx
// ============================================
"use client";

import { useCallback, useState } from 'react';
import { useWriteContracts } from 'wagmi/experimental';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther } from 'viem';
import type { BaseError } from 'wagmi';

// Tipping options
const TIPPING_OPTIONS = [
  { amount: 1, label: '$1', value: '0.0003' }, // Assuming ETH price ~$3000
  { amount: 5, label: '$5', value: '0.0017' },
];

export function MicroTippingAction() {
  const { chain, status: accountStatus, address } = useAccount();
  const [selectedAmount, setSelectedAmount] = useState(TIPPING_OPTIONS[1]); // Default to $5
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const { 
    data: bundleIdentifier, 
    isPending, 
    error, 
    writeContracts,
    reset 
  } = useWriteContracts();

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isTransactionConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: bundleIdentifier?.id as `0x${string}` | undefined,
  });

  const handleSendTip = useCallback(() => {
    // Reset states
    setIsConfirmed(false);
    
    writeContracts({
      contracts: [
        {
          address: '0xd2135CfB216b74109775236E36d4b433F1DF507B', // Recipient address
          abi: parseAbi(['function transfer(address,uint256) returns (bool)']),
          functionName: 'transfer',
          args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B', parseEther(selectedAmount.value)],
        },
      ],
    });
  }, [writeContracts, selectedAmount]);

  const handleReset = useCallback(() => {
    reset();
    setIsConfirmed(false);
    setSelectedAmount(TIPPING_OPTIONS[1]);
  }, [reset]);

  // Set confirmed state when transaction is confirmed
  if (isTransactionConfirmed && !isConfirmed) {
    setIsConfirmed(true);
  }

  // Confirmed success state
  if (isConfirmed) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs text-gray-600 mb-3">Your {selectedAmount.label} tip has been sent</p>
          
          <div className="flex gap-2 w-full">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Send another tip
            </button>
            {chain?.blockExplorers?.default.url && bundleIdentifier?.id && (
              <a
                href={`${chain.blockExplorers.default.url}/tx/${bundleIdentifier.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View tx →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Confirming state
  if (isConfirming) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="5" 
                stroke="currentColor" 
                strokeWidth="3"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Processing your tip...</p>
            <p className="text-xs text-gray-600">Confirming {selectedAmount.label} transaction</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || receiptError) {
    const displayError = error || receiptError;
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Transaction failed</p>
            <p className="text-xs text-red-600 mt-0.5">
              {(displayError as BaseError)?.shortMessage || displayError?.message || 'Unable to send tip'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Transaction sent, waiting for receipt
  if (bundleIdentifier && !isConfirming) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Transaction sent!</p>
            <p className="text-xs text-gray-600">Waiting for confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main tipping interface
  return (
    <div 
      className={`bg-white rounded-lg p-4 m-4 w-full ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Connect your wallet to send a tip'
          : ''
      }
    >
      {/* Profile Section */}
      <div className="flex flex-col items-left mb-4">
        {/* Profile Image Circle */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-pink-400 flex items-center justify-center mb-3">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Amount Selection */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          {TIPPING_OPTIONS.map((option) => (
            <button
              key={option.amount}
              onClick={() => setSelectedAmount(option)}
              disabled={accountStatus === 'disconnected'}
              className={`
                px-2 py-2 rounded-lg text-xs font-medium transition-all
                ${selectedAmount.amount === option.amount
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }
                ${accountStatus === 'disconnected' ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">☕</span>
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Buy Me a Coffee Button */}
      <button
        onClick={handleSendTip}
        disabled={isPending || accountStatus === 'disconnected'}
        className={`
          w-full px-3 py-2.5 rounded-lg font-medium text-xs text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${isPending || accountStatus === 'disconnected'
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600'
          }
        `}
      >
        {accountStatus === 'disconnected' ? (
          'Sign in'
        ) : isPending ? (
          <>
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="3"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs">Sending tip...</span>
          </>
        ) : (
          <>
            Support me
          </>
        )}
      </button>
    </div>
  );
}