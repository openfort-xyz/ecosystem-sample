import * as React from 'react'
import { useAccount, useConnect } from 'wagmi'
import { ecosystemWalletInstance } from './lib/ecosystemWallet'

import { Landing } from './components/Landing'
import { Dashboard } from './components/Dashboard'
import Loading from './components/Loading'

export function Home() {
  const account = useAccount()
  const { connectors, connect } = useConnect()
  const [isAutoConnecting, setIsAutoConnecting] = React.useState(true)
  const hasAttemptedConnect = React.useRef(false)

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

  // Auto-connect if there's an existing session
  React.useEffect(() => {
    if (!hasAttemptedConnect.current && !account.isConnected && connectors.length > 0) {
      const injectedConnector = connectors.find(
        (connector) => connector.id === 'com.rapidfire.id'
      )
      if (injectedConnector) {
        hasAttemptedConnect.current = true
        connect({ connector: injectedConnector })
        // Give it a moment to connect, then stop loading
        setTimeout(() => {
          setIsAutoConnecting(false)
        }, 500)
      } else {
        setIsAutoConnecting(false)
      }
    } else if (account.isConnected) {
      setIsAutoConnecting(false)
    } else if (connectors.length > 0 && hasAttemptedConnect.current) {
      setIsAutoConnecting(false)
    }
  }, [account.isConnected, connectors, connect])

  if (isAutoConnecting) return <Loading />
  if (!account.isConnected) return <Landing />
  return <Dashboard />
}

