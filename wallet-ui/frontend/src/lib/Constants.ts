import type { Address } from 'ox'
import { ancient8Sepolia, base, baseSepolia, dosChainTestnet, kromaSepolia, polygonAmoy, sepolia } from 'viem/chains'
import { ChainId } from './Wagmi'


export const DEFAULT_POLL_INTERVAL_MS = 5_000

export const ethAsset = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  logo: '/icons/eth.svg',
  name: 'Ethereum',
  symbol: 'ETH',
} as const

export const defaultAssets: Record<
  ChainId,
  ReadonlyArray<{
    name: string
    logo: string
    symbol: string
    decimals: number
    address: Address.Address
    price?: number
  }>
> = {
  [baseSepolia.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
    {
      address: '0xdC2de190a921D846B35EB92d195c9c3D9C08d1C2',
      decimals: 6,
      logo: '/icons/usdc.svg',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      logo: '/icons/weth.svg',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
  ],
  [polygonAmoy.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/matic.svg',
      name: 'POLYGON',
      symbol: 'POL',
    },
    {
      address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      decimals: 6,
      logo: '/icons/usdc.svg',
      name: 'USD Coin',
      symbol: 'USDC',
    },
  ],
  [sepolia.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  ],
  [ancient8Sepolia.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  ],
  [dosChainTestnet.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/dos.svg',
      name: 'Dos',
      symbol: 'DOS',
    },
  ],
  [base.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      logo: '/icons/usdc.svg',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      logo: '/icons/weth.png',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
  ]
}
