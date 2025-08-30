// ============================================
// app/components/actions/SIWEAction.tsx
// ============================================
"use client";

import { useCallback, useState, useEffect } from 'react';
import { useSignMessage, useAccount } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';
import { baseSepolia } from 'wagmi/chains';
import type { BaseError } from 'wagmi';

export function SIWEAction() {
  const { address, chainId, chain, status: accountStatus } = useAccount();
  const { 
    signMessage, 
    data: signature, 
    isPending, 
    error,
    reset,
    isSuccess 
  } = useSignMessage();

  // State for managing verification status
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Generate nonce (in production, this should come from your backend)
  const generateNonce = useCallback(() => {
    return Math.random().toString(36).substring(2, 15);
  }, []);

  const handleSIWE = useCallback(() => {
    if (!address) return;

    // Reset states
    setIsVerifying(false);
    setIsVerified(false);
    setVerificationError(null);

    const siweMessage = createSiweMessage({
      domain: window.location.host,
      address: address,
      statement: 'Sign in with Ethereum to authenticate your identity',
      uri: window.location.origin,
      version: '1',
      chainId: chainId ?? baseSepolia.id,
      nonce: generateNonce(),
      issuedAt: new Date(),
      expirationTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });
    
    signMessage({ message: siweMessage });
  }, [signMessage, chainId, address, generateNonce]);

  // Simulate verification process after signing
  useEffect(() => {
    if (signature && isSuccess && !isVerifying && !isVerified) {
      setIsVerifying(true);
      
      // Simulate backend verification (in production, this would be an API call)
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
      }, 1500);
    }
  }, [signature, isSuccess, isVerifying, isVerified]);

  const handleReset = useCallback(() => {
    reset();
    setIsVerifying(false);
    setIsVerified(false);
    setVerificationError(null);
  }, [reset]);

  // Verified success state
  if (isVerified) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[320px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Authentication successful!</p>
            <p className="text-sm text-gray-600">You are now signed in</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Wallet Address</p>
          <p className="text-xs font-mono text-gray-700 break-all">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign in again
          </button>
          {signature && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(signature);
              }}
              className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Copy signature
            </button>
          )}
        </div>
      </div>
    );
  }

  // Verifying signature state
  if (isVerifying) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[320px]">
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
            <p className="font-medium text-gray-900">Verifying signature...</p>
            <p className="text-sm text-gray-600">Please wait while we verify your identity</p>
          </div>
        </div>
      </div>
    );
  }

  // Signature obtained, waiting for verification
  if (signature && !isVerifying) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-[320px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Signature obtained!</p>
            <p className="text-sm text-gray-600">Processing authentication...</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 break-all">
            Signature: {signature.slice(0, 20)}...{signature.slice(-10)}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || verificationError) {
    const displayError = verificationError || error;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 w-[320px]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Authentication failed</p>
            <p className="text-sm text-red-600 mt-1">
              {typeof displayError === 'string' 
                ? displayError 
                : (displayError as BaseError)?.shortMessage || displayError?.message || 'Failed to sign message'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Main authentication card
  return (
    <div 
      className={`bg-white rounded-lg border w-[320px] border-gray-200 p-4 ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Connect your wallet to sign in'
          : ''
      }
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Icon */}

        {/* Title and Description */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            Authentication
          </h3>
        </div>
      </div>

      {/* Sign Button */}
      <button
        onClick={handleSIWE}
        disabled={isPending || accountStatus === 'disconnected'}
        className={`
          w-full px-6 py-2 rounded-lg font-medium text-sm text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${isPending || accountStatus === 'disconnected'
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
          }
        `}
      >
        {accountStatus === 'disconnected' ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Connect Wallet
          </>
        ) : isPending ? (
          <>
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
            Signing message...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Sign in with Ethereum
          </>
        )}
      </button>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center mt-3">
        {accountStatus === 'disconnected' 
          ? 'Connect your wallet to authenticate'
          : 'Sign a message to prove wallet ownership'
        }
      </p>
    </div>
  );
}