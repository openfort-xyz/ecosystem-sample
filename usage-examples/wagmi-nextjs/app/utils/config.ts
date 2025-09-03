import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = createConfig({
  ...getDefaultConfig({
    appName: 'Rapidfire Demo',
    projectId: 'YOUR_PROJECT_ID',
    chains: [baseSepolia],
  }),
  connectors: [injected()],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
