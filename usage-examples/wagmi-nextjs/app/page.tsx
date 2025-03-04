'use client';

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { WalletConnect } from "./components/wallet/WalletConnect";
import { AnimatedBackground } from "./components/layout/AnimatedBackground";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./utils/config";

const queryClient = new QueryClient();
export default function Home() {
  return (
<main className="relative min-h-screen bg-[#0A0A0A] text-white">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl space-y-8">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Header />
            <WalletConnect />
            <Footer />
          </QueryClientProvider>
          </WagmiProvider>
        </div>
      </div>
    </main>
  );
}