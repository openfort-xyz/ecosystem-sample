// ============================================
// app/components/actions/EarnMorphoAction.tsx
// ============================================
"use client";

import { useCallback, useState, useEffect } from 'react';
import { useWriteContracts } from 'wagmi/experimental';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther } from 'viem';
import type { BaseError } from 'wagmi';

// Morpho protocol configuration
const MORPHO_CONFIG = {
  name: 'Morpho',
  apy: 4.3,
  minDeposit: 0.01,
  contractAddress: '0x777777c9898D384F785Ee44Acfe945efDFf5f3E0', // Example Morpho contract
};

export function EarnAction() {
  const { chain, status: accountStatus, address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  
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

  // Calculate estimated daily earnings
  const getDailyEarnings = () => {
    return ((balance * MORPHO_CONFIG.apy) / 100 / 365).toFixed(4);
  };

  // Calculate USD value (assuming ETH at $3000)
  const getUsdValue = (ethAmount: number) => {
    return (ethAmount * 3000).toFixed(2);
  };

  const handleDeposit = useCallback(() => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    // Reset states
    setIsConfirmed(false);
    
    // Mock deposit transaction
    writeContracts({
      contracts: [
        {
          address: MORPHO_CONFIG.contractAddress,
          abi: parseAbi(['function deposit(uint256) payable']),
          functionName: 'deposit',
          args: [parseEther(depositAmount)],
          value: parseEther(depositAmount),
        },
      ],
    });
  }, [writeContracts, depositAmount]);

  const handleReset = useCallback(() => {
    reset();
    setIsConfirmed(false);
    setDepositAmount('');
    setShowDepositModal(false);
  }, [reset]);

  // Update balance when transaction is confirmed
  useEffect(() => {
    if (isTransactionConfirmed && !isConfirmed && depositAmount) {
      setBalance(prevBalance => prevBalance + parseFloat(depositAmount));
      setIsConfirmed(true);
      setDepositAmount('');
      setShowDepositModal(false);
    }
  }, [isTransactionConfirmed, isConfirmed, depositAmount]);

  // Simulate earning updates (in production, this would come from the blockchain)
  useEffect(() => {
    if (balance > 0) {
      const interval = setInterval(() => {
        const earnedPerSecond = (balance * MORPHO_CONFIG.apy) / 100 / 365 / 24 / 60 / 60;
        setTotalEarned(prev => prev + earnedPerSecond);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [balance]);

  // Success state
  if (isConfirmed && !showDepositModal) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-xs font-semibold text-gray-900 mb-2">Deposit Successful!</p>
          <p className="text-xs text-gray-600 mb-2">Your funds are now earning {MORPHO_CONFIG.apy}% APY</p>
          
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsConfirmed(false)}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              View earnings
            </button>
            {chain?.blockExplorers?.default.url && bundleIdentifier?.id && (
              <a
                href={`${chain.blockExplorers.default.url}/tx/${bundleIdentifier.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
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
            <p className="text-xs font-medium text-gray-900">Processing deposit...</p>
            <p className="text-xs text-gray-600">Depositing {depositAmount} ETH to Morpho</p>
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
        <div className="flex items-start gap-2 mb-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">Deposit failed</p>
            <p className="text-xs text-red-600 mt-0.5">
              {(displayError as BaseError)?.shortMessage || displayError?.message || 'Unable to complete deposit'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Deposit Modal
  if (showDepositModal) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Deposit to Morpho</h3>
          <button
            onClick={() => setShowDepositModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Deposit Input */}
        <div className="mb-2">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                className="text-lg font-medium bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded">
                <span className="text-sm font-bold text-blue-600">Ξ</span>
                <span className="text-xs font-medium text-blue-600">ETH</span>
              </div>
            </div>
            {depositAmount && (
              <p className="text-xs text-gray-500 mt-1">≈ ${getUsdValue(parseFloat(depositAmount))}</p>
            )}
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {['0.1', '0.5', '1', '2'].map((amount) => (
            <button
              key={amount}
              onClick={() => setDepositAmount(amount)}
              className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              {amount} ETH
            </button>
          ))}
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={isPending || !depositAmount || parseFloat(depositAmount) < MORPHO_CONFIG.minDeposit}
          className={`
            w-full px-4 py-2.5 rounded-lg font-semibold text-white text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${isPending || !depositAmount || parseFloat(depositAmount) < MORPHO_CONFIG.minDeposit
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }
          `}
        >
          {isPending ? (
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
              <span className="text-xs">Processing...</span>
            </>
          ) : !depositAmount || parseFloat(depositAmount) < MORPHO_CONFIG.minDeposit ? (
            `Min deposit ${MORPHO_CONFIG.minDeposit} ETH`
          ) : (
            'Deposit'
          )}
        </button>
      </div>
    );
  }

  // Main Earn interface
  return (
    <div 
      className={`bg-white rounded-lg p-4 m-4 w-full ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Sign in to start earning'
          : ''
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {balance > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-600">Earning</span>
          </div>
        )}
      </div>

      {/* Morpho Box */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-blue-600">M</span>
              </div>
              <p className="font-semibold text-sm text-gray-900">Morpho</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">APY</p>
            <p className="text-sm font-bold text-green-600">{MORPHO_CONFIG.apy}%</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Balance</span>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">{balance.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500">${getUsdValue(balance)}</p>
            </div>
          </div>
          
          {balance > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Earned</span>
              <div className="text-right">
                <p className="text-xs font-semibold text-blue-600">+{totalEarned.toFixed(8)} ETH</p>
                <p className="text-xs text-gray-500">${getUsdValue(totalEarned)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Earnings Info */}
      {balance > 0 && (
        <div className="bg-blue-50 rounded p-2 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Daily earnings</span>
            <span className="font-medium text-gray-900">~{getDailyEarnings()} ETH</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDepositModal(true)}
          disabled={accountStatus === 'disconnected'}
          className={`
            flex-1 px-4 py-2.5 rounded-lg font-semibold text-white text-xs
            transition-all duration-200
            ${accountStatus === 'disconnected'
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }
          `}
        >
          {accountStatus === 'disconnected' ? 'Sign in' : balance > 0 ? 'Add more' : 'Start earning'}
        </button>
        
        {balance > 0 && (
          <button
            className="px-4 py-2.5 rounded-lg font-semibold text-gray-700 text-xs bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}