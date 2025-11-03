import { http, createConfig } from 'wagmi'
import { ancient8Sepolia, baseSepolia, polygonAmoy, sepolia, dosChainTestnet, base } from 'wagmi/chains'

export const config = createConfig({
  chains: [polygonAmoy, base, baseSepolia, sepolia, ancient8Sepolia, dosChainTestnet],
  transports: {
    [polygonAmoy.id]: http('https://polygon-amoy.gateway.tenderly.co'),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [ancient8Sepolia.id]: http(),
    [dosChainTestnet.id]: http(),
    [base.id]: http("https://mainnet.base.org"),
  },
})

export type Chain = (typeof config.chains)[number]
export type ChainId = Chain['id']
export const getChainConfig = (chainId: ChainId) =>
  config.chains.find((c) => c.id === chainId)

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
