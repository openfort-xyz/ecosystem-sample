import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';

import * as Wagmi from './lib/Wagmi';
import * as Query from './lib/Query'

const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={Wagmi.config}>
      <QueryClientProvider client={Query.client}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvidersWrapper>
        <App />
      </ProvidersWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

