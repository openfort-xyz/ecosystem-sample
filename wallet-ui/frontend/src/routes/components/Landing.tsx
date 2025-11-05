import * as React from "react";
import { Button, RecoveryMethod, useOpenfort } from '@openfort/ecosystem-js/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { GlobeIcon, Lock } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { useChainId } from "wagmi";

type ProviderResponse = {
  provider: ProviderType;
  type: string;
};
const availableProviders = [
  'google',
  'twitter',
] as const;

type ProviderType = typeof availableProviders[number];

export function Landing() {
  const { login, configuration, isAuthenticated, isReady, handleWalletRecovery } = useOpenfort();
  const [showPasswordInput, setShowPasswordInput] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [recoveryError, setRecoveryError] = React.useState("");
  const [isRecovering, setIsRecovering] = React.useState(false);
  const chainId = useChainId();

  React.useEffect(() => {

    const attemptWalletRecovery = async () => {
      if (isAuthenticated && !isReady && !showPasswordInput && !isRecovering) {
        setIsRecovering(true);
        try {
          await handleWalletRecovery({method: RecoveryMethod.AUTOMATIC, chainId});
          // If we get here, recovery was successful without password
          setIsRecovering(false);
        } catch (error) {
          // If we get here, we need a password
          setShowPasswordInput(true);
          setRecoveryError("Password required to recover your wallet");
          setIsRecovering(false);
        }
      }
    };
    console.log("Attempting wallet recovery");
    attemptWalletRecovery();
  }, [isAuthenticated, isReady, showPasswordInput, chainId, handleWalletRecovery]);

  // Handle password recovery
  const handlePasswordRecovery = async () => {
    if (!password) {
      setRecoveryError("Password is required");
      return;
    }

    setIsRecovering(true);
    setRecoveryError("");
    
    try {
      await handleWalletRecovery({password, method: RecoveryMethod.PASSWORD, chainId});
      setShowPasswordInput(false);
    } catch (error) {
      setRecoveryError(
        error instanceof Error ? error.message : "Failed to recover wallet. Please try again."
      );
    } finally {
      setIsRecovering(false);
    }
  };
  const { data, isLoading } = useQuery<{ data: ProviderResponse[] }>({
    queryKey: ['myData'],
    queryFn: async () => {
      const response = await fetch('https://api.openfort.io/iam/v1/providers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${configuration.publishableKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
  });

  const providerIcons: Record<ProviderType, React.FC> = {
    google: Google,
    twitter: Twitter,
  };

  const AuthProviderButton = (
    {
      onClick,
      provider,
    }: {
      onClick: () => void;
      provider: ProviderType;
    },
  ) => {
    const Icon = providerIcons[provider] || GlobeIcon;
    const label = provider.charAt(0).toUpperCase() + provider.slice(1);
  
    return (
      <div>
      <Button
          onClick={onClick}
          icon={<Icon />}
          iconPosition="right"
        >
          {`Continue with ${label}`}
        </Button>
      </div>
    );
  };

  const providers = useMemo(() => (
    data?.data?.filter((p) => p.type === 'oauth').filter((p) => availableProviders.includes(p.provider))
    || []
  ), [data]);

  if (showPasswordInput) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-center">
            <LogoMark />
          </div>
          <h1 className="mb-6 text-center text-2xl font-bold">Wallet Recovery</h1>
          <p className="mb-4 text-center text-gray-600">
            Please enter your password to recover your wallet
          </p>
          
          {recoveryError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
              {recoveryError}
            </div>
          )}
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                className="w-full rounded-md border border-gray-300 px-10 py-2 focus:border-blue-500 focus:outline-none"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                value={password}
              />
            </div>
          </div>
          
          <Button
            className="w-full"
            disabled={isRecovering}
            onClick={handlePasswordRecovery}
            variant="primary"
          >
            {isRecovering ? "Recovering..." : "Recover Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center justify-center w-full px-6 py-12">
        <div className="sm:mx-auto w-full max-w-sm">
          {/* Logo - square with rounded corners */}
            <div className="mx-auto flex justify-center">
              <LogoMark />
            </div>
          
          {/* Updated heading and subheading */}
          <h2 className="mt-10 text-center text-2xl font-semibold leading-6 text-gray-900">
            Welcome to Rapidfire
          </h2>
          <p className="mt-2 text-center text-base text-gray-500">
            Log in or sign up to get started.
          </p>
        </div>

        <div className="mt-10 mx-auto w-full max-w-sm">
          {providers.length > 0 && (
            <div className="py-3" style={{ height: isLoading ? 175 : undefined }}>
              {
                providers.map((provider) => (
                  <AuthProviderButton
                    key={provider.provider}
                    provider={provider.provider}
                    onClick={async () => {
                      try {
                        await login({ provider: provider.provider, windowStrategy: 'iframe' });
                      } catch (error) {
                        console.error('[LoginMethods]', error);
                      }
                    }}
                  />
                ))
              }
            </div>
        )
      }
        </div>
        <div className="h-6" />
        <div className='flex items-center'>
            <p className="text-sm text-gray-400 text-center">
            Want to integrate Rapidfire with your application?{' '}
            <a 
              href="https://rapidfire.sample.openfort.io" 
              className="text-blue-500 hover:text-blue-700"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Learn more
            </a>
            </p>
        </div>
      </div>
      
      {/* Footer - fixed at the bottom */}
      <footer className="w-full py-6">
        <nav>
          <ul className="flex justify-center space-x-6 text-sm text-gray-400">
            <li>
              <a href="https://www.openfort.io/docs/products/cross-app-wallet" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
                Developers
              </a>
            </li>
            <li>
              <a href={`https://${window.location.hostname}/privacy`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
                Privacy
              </a>
            </li>
            <li>
              <a href={`https://${window.location.hostname}/terms`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
                Terms
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  )
}

const Twitter = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="128"
    height="128"
    viewBox="0 0 128 128"
  >
    <path
      fill="currentColor"
      strokeWidth={0.104373}
      d="M75.916 54.2 122.542 0h-11.05L71.008 47.06 38.672 0H1.376l48.898 71.164L1.376 128h11.05L55.18 78.303 89.328 128h37.296L75.913 54.2ZM60.782 71.79l-4.955-7.086-39.42-56.386h16.972L65.19 53.824l4.954 7.086 41.353 59.15h-16.97L60.782 71.793Z"
    />
  </svg>
);

const Google = () => (
  <svg viewBox="0 0 128 128" width="28px" height="28px">
    <path
      fill="#fff"
      d="M44.59 4.21a63.28 63.28 0 0 0 4.33 120.9 67.6 67.6 0 0 0 32.36.35 57.13 57.13 0 0 0 25.9-13.46 57.44 57.44 0 0 0 16-26.26 74.3 74.3 0 0 0 1.61-33.58H65.27v24.69h34.47a29.72 29.72 0 0 1-12.66 19.52 36.2 36.2 0 0 1-13.93 5.5 41.3 41.3 0 0 1-15.1 0A37.2 37.2 0 0 1 44 95.74a39.3 39.3 0 0 1-14.5-19.42 38.3 38.3 0 0 1 0-24.63 39.25 39.25 0 0 1 9.18-14.91A37.17 37.17 0 0 1 76.13 27a34.3 34.3 0 0 1 13.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.2 61.2 0 0 0 87.2 4.59a64 64 0 0 0-42.61-.38"
    />
    <path
      fill="#e33629"
      d="M44.59 4.21a64 64 0 0 1 42.61.37 61.2 61.2 0 0 1 20.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.3 34.3 0 0 0-13.64-8 37.17 37.17 0 0 0-37.46 9.74 39.25 39.25 0 0 0-9.18 14.91L8.76 35.6A63.53 63.53 0 0 1 44.59 4.21"
    />
    <path
      fill="#f8bd00"
      d="M3.26 51.5a63 63 0 0 1 5.5-15.9l20.73 16.09a38.3 38.3 0 0 0 0 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 0 1-5.5-40.9"
    />
    <path
      fill="#587dbd"
      d="M65.27 52.15h59.52a74.3 74.3 0 0 1-1.61 33.58 57.44 57.44 0 0 1-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0 0 12.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68"
    />
    <path
      fill="#319f43"
      d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0 0 44 95.74a37.2 37.2 0 0 0 14.08 6.08 41.3 41.3 0 0 0 15.1 0 36.2 36.2 0 0 0 13.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 0 1-25.9 13.47 67.6 67.6 0 0 1-32.36-.35 63 63 0 0 1-23-11.59A63.7 63.7 0 0 1 8.75 92.4"
    />
  </svg>
);

