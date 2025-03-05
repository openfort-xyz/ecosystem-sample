import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { config } from "../utils/config";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthProvider>
  );
}

export default MyApp;
