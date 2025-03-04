import { http, createConfig } from 'wagmi'
import { ancient8Sepolia, baseSepolia, polygonAmoy, sepolia, dosChainTestnet, kromaSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [polygonAmoy, baseSepolia, sepolia, ancient8Sepolia, dosChainTestnet, kromaSepolia],
  transports: {
    [polygonAmoy.id]: http(),
    [baseSepolia.id]: http("https://newest-radial-gadget.base-sepolia.quiknode.pro/a33177b3c598ebf17b67f1f0f3d4c4f2d7c04913"),
    [sepolia.id]: http(),
    [ancient8Sepolia.id]: http(),
    [dosChainTestnet.id]: http(),
    [kromaSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}