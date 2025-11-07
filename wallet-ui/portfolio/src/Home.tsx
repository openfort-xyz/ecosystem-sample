import * as React from 'react'
import { useAccount } from 'wagmi'
import { ecosystemWalletInstance } from './lib/ecosystemWallet'

import { Landing } from './components/Landing'
import { Dashboard } from './components/Dashboard'

export function Home() {
  const account = useAccount()

  // Initialize ecosystem wallet iframe
  React.useEffect(() => {
    const provider = ecosystemWalletInstance.getEthereumProvider({
      policy: process.env.REACT_APP_POLICY_ID,
    });
    
    // Auto-switch to Sepolia if provider is on wrong chain
    const ensureCorrectChain = async () => {
      if (provider && typeof (provider as any).request === 'function') {
        try {
          const currentChainHex = await (provider as any).request({ method: 'eth_chainId' }) as string;
          const currentChainId = parseInt(currentChainHex, 16);
          
          if (currentChainId !== 11155111) {
            await (provider as any).request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          }
        } catch (error) {
          console.error('Chain switch failed:', error);
        }
      }
    };
    
    setTimeout(ensureCorrectChain, 500);
  }, []);

  if (!account.isConnected) return <Landing />
  return <Dashboard />
}

