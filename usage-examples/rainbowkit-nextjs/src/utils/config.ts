import { createConfig, http } from 'wagmi';
import { polygonAmoy, sepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { rapidfireID } from '../components/RainbowKit.RapidfireID';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rapidfireID],
    },
  ],
  {
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
  }
);

// create the Wagmi config for Immutable zkEVM Testnet
export const config = createConfig({
  chains: [polygonAmoy, sepolia],
  ssr: true,
  connectors: connectors,
  transports: {
    [polygonAmoy.id]: http(),
    [sepolia.id]: http(),
  },
});
