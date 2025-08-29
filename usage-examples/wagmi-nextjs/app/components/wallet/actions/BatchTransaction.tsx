// ============================================
// app/components/actions/BatchTransactionsAction.tsx
// ============================================
"use client";

import { useCallback } from 'react';
import { useWriteContracts } from 'wagmi/experimental';
import { useAccount } from 'wagmi';
import { parseAbi } from 'viem';

export function BatchTransactionsAction() {
  const { chain } = useAccount();
  const { data: bundleIdentifier, isPending, error, writeContracts } = useWriteContracts();

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
          args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B',10000000000000000],
        },
      ],
    });
  }, [writeContracts]);

  // Success state
  if (bundleIdentifier) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Success!</p>
          <a
            href={`${chain?.blockExplorers?.default.url}/tx/${bundleIdentifier.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View transaction →
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <p className="text-sm text-red-600">Transaction failed</p>
      </div>
    );
  }

  // Main checkout card
  return (
    <div className="bg-white rounded-lg border w-[300px] border-gray-200 p-4">
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
        disabled={isPending}
        className={`
          w-full px-6 py-2 rounded-lg font-medium text-sm text-white
          transition-all duration-200 
          ${isPending 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
          }
        `}
      >
        {isPending ? (
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
            Processing...
          </span>
        ) : (
          'Buy Now'
        )}
      </button>
    </div>
  );
}