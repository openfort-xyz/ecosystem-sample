import * as React from 'react'
import type { Address } from 'ox'
import { erc20Abi } from 'viem'
import { useAccount, useBalance, useReadContracts } from 'wagmi'

import { defaultAssets, ethAsset } from '../lib/Constants'
import { ChainId } from '../lib/Wagmi'

const SYNC_INTERVAL_MS = 1_000
const STALE_TIME_MS = 1_000

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
  const hasAccountAddress = Boolean(accountAddress)
  const canFetchBalances = hasAccountAddress && Boolean(chainId)

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: accountAddress,
    chainId,
    query: {
      enabled: canFetchBalances,
      staleTime: STALE_TIME_MS,
      gcTime: 60_000,
      refetchInterval: canFetchBalances ? SYNC_INTERVAL_MS : false,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })

  const { data, isLoading, isPending, refetch } = useReadContracts({
    contracts: assets.map((asset) => ({
      abi: erc20Abi,
      address: asset.address,
      args: [accountAddress],
      functionName: 'balanceOf',
    })),
    query: {
      enabled: canFetchBalances,
      staleTime: STALE_TIME_MS,
      gcTime: 60_000,
      refetchInterval: canFetchBalances ? SYNC_INTERVAL_MS : false,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select: (data) => {
        const result = data.map((datum, index) => ({
          balance:
            typeof datum.result === 'bigint'
              ? datum.result
              : datum.result != null
                ? BigInt(datum.result as string | number)
                : BigInt(0),
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
    },
  })

  const refetchAll = React.useCallback(async () => {
    if (!canFetchBalances) return

    await Promise.allSettled([
      refetch({ cancelRefetch: true, throwOnError: false }),
      refetchEthBalance({ cancelRefetch: true, throwOnError: false }),
    ])
  }, [canFetchBalances, refetch, refetchEthBalance])

  return {
    data,
    isLoading,
    isPending,
    refetch: () => refetchAll(),
  }
}
