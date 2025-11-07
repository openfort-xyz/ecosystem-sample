import * as React from 'react'
import type { Address } from 'ox'
import { erc20Abi } from 'viem'
import { useAccount, useBalance, useReadContracts } from 'wagmi'

import {
  DEFAULT_POLL_INTERVAL_MS,
  defaultAssets,
  ethAsset,
} from '../lib/Constants'
import { ChainId } from '../lib/Wagmi'

export function useReadBalances({
  address,
  chainId,
}: {
  address?: Address.Address | undefined
  chainId: ChainId
}) {
  const assets = defaultAssets[chainId]?.filter(
    (asset) => asset.address !== '0x0000000000000000000000000000000000000000',
  )
  if (!assets) throw new Error(`Unsupported chainId: ${chainId}`)

  const account = useAccount()
  const accountAddress = address ?? account.address
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: accountAddress,
    chainId,
  })

  const { data, isLoading, isPending, refetch } = useReadContracts({
    contracts: assets.map((asset) => ({
      abi: erc20Abi,
      address: asset.address,
      args: [accountAddress],
      functionName: 'balanceOf',
    })),
    query: {
      enabled: !!accountAddress,
      select: (data) => {
        const result = data.map((datum, index) => ({
          balance: BigInt(datum.result!),
          ...assets[index],
        }))

        result.unshift({ balance: ethBalance?.value ?? BigInt(0), ...ethAsset })

        return result as ReadonlyArray<{
          balance: bigint
          logo: string
          symbol: string
          name: string
          address: string
        }>
      },
      staleTime: DEFAULT_POLL_INTERVAL_MS,
    },
  })

  React.useEffect(() => {
    if (account.status !== 'connected' || !accountAddress) return

    const interval = setInterval(() => {
      refetch()
      refetchEthBalance()
    }, DEFAULT_POLL_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [account.status, accountAddress, refetch, refetchEthBalance])

  return {
    data,
    isLoading,
    isPending,
    refetch,
  }
}

