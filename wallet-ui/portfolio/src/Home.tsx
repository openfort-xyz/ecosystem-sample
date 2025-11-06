import * as React from 'react'
import { useAccount } from 'wagmi'

import { Landing } from './components/Landing'
import { Dashboard } from './components/Dashboard'
import Loading from './components/Loading'

export function Home() {
  const account = useAccount()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  if (!account.isConnected) return <Landing />
  return <Dashboard />
}

