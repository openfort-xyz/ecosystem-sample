// ============================================
// app/components/actions/SendTransaction.tsx
// ============================================
"use client";

import { useCallback, useState, useEffect } from 'react';
import { useWriteContracts } from 'wagmi/experimental';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther } from 'viem';
import type { BaseError } from 'wagmi';

// Fixed tokens - only USDC and ETH
const TOKENS = {
  USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💵', color: 'green', decimals: 6 },
  ETH: { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'blue', decimals: 18 },
};

// Mock exchange rate
const EXCHANGE_RATE = {
  USDC_TO_ETH: 0.000333, // 1 USDC = 0.000333 ETH (ETH at $3000)
  ETH_TO_USDC: 3000, // 1 ETH = 3000 USDC
};

export function TradingSwapAction() {
  const { chain, status: accountStatus, address } = useAccount();
  const [sellToken, setSellToken] = useState(TOKENS.USDC);
  const [buyToken, setBuyToken] = useState(TOKENS.ETH);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
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

  // Calculate buy amount based on sell amount
  useEffect(() => {
    if (sellAmount) {
      const amount = parseFloat(sellAmount);
      if (!isNaN(amount)) {
        if (sellToken.symbol === 'USDC') {
          const calculated = (amount * EXCHANGE_RATE.USDC_TO_ETH).toFixed(6);
          setBuyAmount(calculated);
        } else {
          const calculated = (amount * EXCHANGE_RATE.ETH_TO_USDC).toFixed(2);
          setBuyAmount(calculated);
        }
      } else {
        setBuyAmount('');
      }
    } else {
      setBuyAmount('');
    }
  }, [sellAmount, sellToken.symbol]);

  const handleSwap = useCallback(() => {
    if (!sellAmount || !buyAmount) return;
    
    // Reset states
    setIsConfirmed(false);
    
    // Mock swap transaction
    writeContracts({
      contracts: [
        {
          address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap Router
          abi: parseAbi(['function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)']),
          functionName: 'swapExactTokensForTokens',
          args: [
            parseEther(sellAmount),
            parseEther((parseFloat(buyAmount) * 0.995).toString()), // Account for 0.5% slippage
            address || '0x0000000000000000000000000000000000000000',
            Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
          ],
        },
      ],
    });
  }, [writeContracts, sellAmount, buyAmount, sellToken, buyToken, address]);

  const handleReset = useCallback(() => {
    reset();
    setIsConfirmed(false);
    setSellAmount('');
    setBuyAmount('');
    setSellToken(TOKENS.USDC);
    setBuyToken(TOKENS.ETH);
  }, [reset]);

  const swapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
  };

  // Set confirmed state when transaction is confirmed
  if (isTransactionConfirmed && !isConfirmed) {
    setIsConfirmed(true);
  }

  // Confirmed success state
  if (isConfirmed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 m-4 w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-xs font-semibold text-gray-900 mb-2">Swap Successful!</p>
          <div className="bg-gray-50 rounded p-2 w-full mb-3">
            <p className="text-xs text-gray-600">
              {sellAmount} → {buyAmount}
            </p>
          </div>
          
          <div className="flex gap-2 w-full">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              New swap
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 m-4 w-full">
        <div className="flex items-center gap-3">
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
            <p className="text-xs font-medium text-gray-900">Processing swap...</p>
            <p className="text-xs text-gray-600">
              {sellAmount} → {buyAmount}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || receiptError) {
    const displayError = error || receiptError;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 m-4 w-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">Swap failed</p>
            <p className="text-xs text-red-600 mt-0.5">
              {(displayError as BaseError)?.shortMessage || displayError?.message || 'Unable to complete swap'}
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

  // Main trading interface - Horizontal layout
  return (
    <div 
      className={`bg-white rounded-lg p-4  m-4 w-full ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Sign in to trade'
          : ''
      }
    >
      {/* Horizontal Swap Layout */}
      <div className="flex items-center gap-2 mb-3">
        {/* Sell Section */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Sell</label>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-full ${sellToken.symbol === 'ETH' ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg font-bold">{sellToken.icon}</span>
              </div>
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
                disabled={accountStatus === 'disconnected'}
                className="text-sm font-medium bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <button
          onClick={swapTokens}
          disabled={accountStatus === 'disconnected'}
          className="mt-6 p-1 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* Buy Section */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Buy</label>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-full ${buyToken.symbol === 'ETH' ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg font-bold">{buyToken.icon}</span>
              </div>
              <input
                type="number"
                value={buyAmount}
                placeholder="0.0"
                readOnly
                className="text-sm font-medium bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Info */}
      {sellAmount && buyAmount && (
        <div className="bg-blue-50 rounded p-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Rate</span>
            <span className="font-medium text-gray-900">
              1 {sellToken.symbol} = {sellToken.symbol === 'USDC' ? EXCHANGE_RATE.USDC_TO_ETH : EXCHANGE_RATE.ETH_TO_USDC} {buyToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-0.5">
            <span className="text-gray-600">Slippage</span>
            <span className="font-medium text-gray-900">0.5%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={isPending || accountStatus === 'disconnected' || !sellAmount || parseFloat(sellAmount) <= 0}
        className={`
          w-full px-4 py-2.5 rounded-lg font-semibold text-white text-xs
          transition-all duration-200 flex items-center justify-center gap-2
          ${isPending || accountStatus === 'disconnected' || !sellAmount || parseFloat(sellAmount) <= 0
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
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
            <span className="text-xs">Processing...</span>
          </>
        ) : !sellAmount || parseFloat(sellAmount) <= 0 ? (
          'Enter amount'
        ) : (
          'Swap'
        )}
      </button>
    </div>
  );
}