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
    ecosystemWalletInstance.getEthereumProvider({
      policy: process.env.REACT_APP_POLICY_ID,
    });
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

