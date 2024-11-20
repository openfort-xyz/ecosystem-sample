import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygonAmoy } from 'wagmi/chains';
import { ConnectKitProvider } from 'connectkit';
import { ecosystemWalletInstance } from "../utils/ecosystemWallet";
import { config } from "../utils/config";
import { useEffect } from "react";

const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    ecosystemWalletInstance.getEthereumProvider({
      chain: polygonAmoy,
      policyId: process.env.NEXT_PUBLIC_POLICY_ID,
    });
  }, []);

  return (
    <AuthProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthProvider>
  );
}

export default MyApp;
