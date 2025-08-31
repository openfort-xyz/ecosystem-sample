// ============================================
// app/components/actions/GrantPermissionsAction.tsx
// ============================================
"use client";

import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { BaseError, createWalletClient, custom } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { erc7715Actions } from 'viem/experimental';

// Pricing tier configuration
const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    usageLimit: 10,
    duration: '24 hours',
    color: 'gray',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    usageLimit: 100,
    duration: '7 days',
    color: 'blue',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$29.99',
    usageLimit: 1000,
    duration: '30 days',
    color: 'purple',
    popular: false
  }
];

export function GrantPermissionAction() {
  const { address, chain, connector, status: accountStatus } = useAccount();
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<BaseError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(PRICING_TIERS[1]); // Default to Pro
  const [isGranted, setIsGranted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Calculate expiry based on tier
  const getExpirySeconds = (tier: typeof PRICING_TIERS[0]) => {
    switch (tier.id) {
      case 'basic':
        return 60 * 60 * 24; // 24 hours
      case 'pro':
        return 60 * 60 * 24 * 7; // 7 days
      case 'enterprise':
        return 60 * 60 * 24 * 30; // 30 days
      default:
        return 60 * 60 * 24; // Default to 24 hours
    }
  };

  const handleGrantPermissions = useCallback(async () => {
    if (!address || !connector) return;

    setIsLoading(true);
    setSessionError(null);
    setIsGranted(false);
    setIsVerifying(false);

    try {
      const provider = await connector.getProvider();
      const privateKey = generatePrivateKey();
      const accountSession = privateKeyToAccount(privateKey).address;
      
      const walletClient = createWalletClient({
        chain: chain,
        transport: custom(provider as any),
      }).extend(erc7715Actions());

      await walletClient.grantPermissions({
        signer: {
          type: "key",
          data: { id: accountSession }
        },
        expiry: getExpirySeconds(selectedTier),
        permissions: [{
          type: 'contract-call',
          data: {
            address: '0x2522f4fc9af2e1954a3d13f7a5b2683a00a4543a',
            calls: []
          },
          policies: [{
            type: { custom: "usage-limit" },
            data: { limit: selectedTier.usageLimit }
          }]
        }],
      });

      setSessionKey(accountSession);
      setIsVerifying(true);

      // Simulate verification
      setTimeout(() => {
        setIsVerifying(false);
        setIsGranted(true);
      }, 1500);
    } catch (e) {
      setSessionError(e as BaseError);
    } finally {
      setIsLoading(false);
    }
  }, [connector, chain, address, selectedTier]);

  const handleReset = useCallback(() => {
    setSessionKey(null);
    setSessionError(null);
    setIsGranted(false);
    setIsVerifying(false);
    setSelectedTier(PRICING_TIERS[1]);
  }, []);

  // Success state
  if (isGranted && sessionKey) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 m-4 w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Permissions Granted!</p>
            <p className="text-xs text-gray-600">Your {selectedTier.name} session is active</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Session Key</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {sessionKey.slice(0, 10)}...{sessionKey.slice(-8)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Plan</p>
              <p className="text-xs font-semibold text-gray-900">{selectedTier.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Usage Limit</p>
              <p className="text-xs font-semibold text-gray-900">{selectedTier.usageLimit} txns</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Duration</p>
              <p className="text-xs font-semibold text-gray-900">{selectedTier.duration}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(sessionKey);
            }}
            className="flex-1 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Copy Session Key
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Grant New Session
          </button>
        </div>
      </div>
    );
  }

  // Verifying state
  if (isVerifying) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 m-4 w-full">
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
            <p className="font-medium text-gray-900">Verifying permissions...</p>
            <p className="text-xs text-gray-600">Setting up your {selectedTier.name} session</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="bg-white rounded-lg p-4 m-4 w-full">
        <div className="flex w-full items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Permission grant failed</p>
            <p className="text-xs text-red-600 mt-1">
              {sessionError.shortMessage || sessionError.message || 'Failed to grant permissions'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-3 py-2 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Main selection interface
  return (
    <div 
      className={`bg-white rounded-lg p-4 m-4 w-full ${
        accountStatus === 'disconnected' ? 'opacity-50' : ''
      }`}
      title={
        accountStatus === 'disconnected'
          ? 'Sign in'
          : ''
      }
    >
      {/* Header */}

      {/* Pricing Tiers - 3 Columns */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            onClick={() => !accountStatus || accountStatus === 'connected' ? setSelectedTier(tier) : null}
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all text-center
              ${selectedTier.id === tier.id 
                ? tier.color === 'blue' 
                  ? 'border-blue-500 bg-blue-50' 
                  : tier.color === 'purple'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-500 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${accountStatus === 'disconnected' ? 'cursor-not-allowed' : ''}
            `}
          >
            {tier.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Popular
                </span>
              </div>
            )}

            <div className="space-y-3">
              {/* Plan Name */}
              <h3 className="font-bold text-gray-900 text-xs">{tier.name}</h3>          

              {/* Usage Info */}
              <div className="space-y-1">
                <p className="text-xs font-normal text-gray-600">
                  {tier.usageLimit} times
                </p>
                <p className="text-xs text-gray-600">{tier.duration}</p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Grant Button */}
      <button
        onClick={handleGrantPermissions}
        disabled={isLoading || accountStatus === 'disconnected'}
        className={`
          w-full px-2 py-2 rounded-lg text-xs font-medium text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${isLoading || accountStatus === 'disconnected'
            ? 'bg-gray-400 cursor-not-allowed' 
            : selectedTier.color === 'blue'
            ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            : selectedTier.color === 'purple'
            ? 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98]'
            : 'bg-gray-600 hover:bg-gray-700 active:scale-[0.98]'
          }
        `}
      >
        {accountStatus === 'disconnected' ? (
          'Sign in'
        ) : isLoading ? (
          <>
            <svg className="animate-spin h-2 w-2" viewBox="0 0 24 24">
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
            Subscribing...
          </>
        ) : (
          <>
            Subscribe
          </>
        )}
      </button>
    </div>
  );
}