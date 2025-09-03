import { createConfig, http } from 'wagmi';
import { base, baseSepolia, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = createConfig({
  ...getDefaultConfig({
    appName: 'Rapidfire Demo',
    projectId: 'YOUR_PROJECT_ID',
    chains: [base],
  }),
  connectors: [injected()],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
