// ============================================
// app/components/actions/BatchTransactionsAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { useWriteContracts,  } from 'wagmi/experimental';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import type { BaseError } from 'wagmi';

export function BatchTransactionsAction() {
  const { chain, status: accountStatus } = useAccount();
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
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: bundleIdentifier?.id as `0x${string}` | undefined,
  });

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
          args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B', 10000000000000000],
        },
      ],
    });
  }, [writeContracts]);

  // Confirmed success state
  if (isConfirmed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[300px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Purchase complete!</p>
            <p className="text-sm text-gray-600">Your Digital Clock has been purchased</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`${chain?.blockExplorers?.default.url}/tx/${bundleIdentifier?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View transaction →
          </a>
          <button
            onClick={() => reset()}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Buy another
          </button>
        </div>
      </div>
    );
  }

  // Confirming state
  if (isConfirming) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[300px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
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
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Waiting for confirmation...</p>
            <p className="text-sm text-gray-600">Please wait while your transaction is being confirmed</p>
          </div>
        </div>
        {bundleIdentifier?.id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 break-all">
              Transaction: {bundleIdentifier.id.slice(0, 10)}...{bundleIdentifier.id.slice(-8)}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error || receiptError) {
    const displayError = error || receiptError;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 w-[300px]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Transaction failed</p>
            <p className="text-sm text-red-600 mt-1">
              {(displayError as BaseError)?.shortMessage || displayError?.message || 'An error occurred'}
            </p>
          </div>
        </div>
        <button
          onClick={() => reset()}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Transaction sent, waiting for receipt
  if (bundleIdentifier && !isConfirming) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[300px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Transaction sent!</p>
            <p className="text-sm text-gray-600">Waiting for blockchain confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout card
  return (
    <div 
      className={`bg-white rounded-lg border w-[300px] border-gray-200 p-4 ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Connect your wallet to buy the Digital Clock'
          : ''
      }
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title and Price */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            Digital Clock
          </h3>
          <p className="text-lg font-bold text-gray-900">
            1 USD
          </p>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleSendBatch}
        disabled={isPending || accountStatus === 'disconnected'}
        className={`
          w-full px-6 py-2 rounded-lg font-medium text-sm text-white
          transition-all duration-200 
          ${isPending || accountStatus === 'disconnected'
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
          }
        `}
      >
        {accountStatus === 'disconnected' ? (
          'Connect Wallet'
        ) : isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            Buying clock...
          </span>
        ) : (
          'Buy Now'
        )}
      </button>

      {/* Wallet connection hint */}
      {accountStatus === 'disconnected' && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Connect your wallet to purchase
        </p>
      )}
    </div>
  );
}