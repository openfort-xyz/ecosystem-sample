// app/page.tsx - Main page where actions are revealed when wallet connects
'use client';

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { WalletConnect } from "./components/wallet/WalletConnect";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./utils/config";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectKitProvider } from "connectkit";

// Import the action components
import { SIWEAction } from "./components/wallet/actions/siwe";
import { SendTransactionAction } from "./components/wallet/actions/SendTransaction";
import { SignTypedDataAction } from "./components/wallet/actions/SignTypedData";
import { PersonalSignAction } from "./components/wallet/actions/PersonalSign";
import { GrantPermissionAction } from "./components/wallet/actions/GrantPermissions";
import { BatchTransactionsAction } from "./components/wallet/actions/BatchTransaction";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white text-black px-6 py-4 sm:px-12 sm:py-6 md:px-24 md:py-8">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
            <ConnectKitProvider theme="midnight">
              <div className="max-w-7xl mx-auto gap-4 sm:gap-6 md:gap-8">
                <div className="w-full md:col-span-4 flex flex-col space-y-4 sm:space-y-6">
                  <Header />
                  <div className="space-y-4 sm:space-y-6">
                    <WalletConnect />
                  </div>
                </div>
                
                {/* Grid of action boxes - buttons appear when wallet is connected */}
                <div className="w-full md:col-span-6 lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md overflow-hidden flex flex-col m-4">
                  
                  {/* SIWE Authentication Box */}
                  <div className="relative rounded-xl bg-gray-100">
                  <div className="absolute top-0 right-0 left-0 flex justify-between p-4">
                    <p className="text-xs sm:text-sm text-muted/30 font-medium px-2 sm:px-2 py-1 sm:py-1">
                      SIWE Authentication
                    </p>
                  </div>
                    <div className="flex h-[300px] items-center justify-center">
                      <SIWEAction />
                    </div>
                  </div>

                  <div className="relative rounded-xl bg-gray-100">
                  <div className="absolute top-0 right-0 left-0 flex justify-between p-4">
                    <p className="text-xs sm:text-sm text-muted/30 font-medium px-2 sm:px-2 py-1 sm:py-1">
                      Swaps
                    </p>
                  </div>
                    <div className="flex h-[300px] items-center justify-center">
                      <SendTransactionAction />
                    </div>
                  </div>

                  <div className="relative rounded-xl bg-gray-100">
                  <div className="absolute top-0 right-0 left-0 flex justify-between p-4">
                    <p className="text-xs sm:text-sm text-muted/30 font-medium px-2 sm:px-2 py-1 sm:py-1">
                      Checkout
                    </p>
                  </div>
                    <div className="flex h-[300px] items-center justify-center">
                      <BatchTransactionsAction />
                    </div>
                  </div>
                  
                  <div className="relative rounded-xl bg-gray-100">
                  <div className="absolute top-0 right-0 left-0 flex justify-between p-4">
                    <p className="text-xs sm:text-sm text-muted/30 font-medium px-2 sm:px-2 py-1 sm:py-1">
                      Micropayments
                    </p>
                  </div>
                    <div className="flex h-[300px] items-center justify-center">
                      <SendTransactionAction />
                    </div>
                  </div>

                  <div className="relative rounded-xl bg-gray-100">
                  <div className="absolute top-0 right-0 left-0 flex justify-between p-4">
                    <p className="text-xs sm:text-sm text-muted/30 font-medium px-2 sm:px-2 py-1 sm:py-1">
                      Subscriptions 
                    </p>
                  </div>
                    <div className="flex h-[300px] items-center justify-center">
                      <GrantPermissionAction />
                    </div>
                  </div>
                  
                </div>
              </div>
            </ConnectKitProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

      <div className="mt-auto pt-4 sm:pt-6 flex items-center">
        <Footer />
      </div>
    </main>
  );
}