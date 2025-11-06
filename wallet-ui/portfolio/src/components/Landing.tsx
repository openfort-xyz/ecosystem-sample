import * as React from "react";
import { useOpenfort } from '@openfort/ecosystem-js/react';
import { LogoMark } from './LogoMark';

export function Landing() {
  const openfort = useOpenfort();

  const connectWallet = React.useCallback(async () => {
    try {
      // Authenticate with Openfort
      await openfort.login({
        returnTo: window.location.pathname
      });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }, [openfort]);

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
          <button
            onClick={connectWallet}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign in with Ethereum
          </button>
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
