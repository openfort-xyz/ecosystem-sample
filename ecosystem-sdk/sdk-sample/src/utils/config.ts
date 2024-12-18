import { createConfig, http } from 'wagmi';
import { polygonAmoy, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// create the Wagmi config for Immutable zkEVM Testnet
export const config = createConfig({
  chains: [polygonAmoy, sepolia],
  ssr: true,
  connectors: [injected()],
  transports: {
    [polygonAmoy.id]: http(),
    [sepolia.id]: http(),
  },
});
