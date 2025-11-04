import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { EcosystemProvider, OpenfortProvider, RecoveryMethod } from '@openfort/ecosystem-js/react';

import * as Wagmi from './lib/Wagmi';
import * as Query from './lib/Query'

const suppressedWarnings = [
  'No events received, re-sending ready.',
  'Core already initialized, ignoring config',
]

const suppressedErrors = [
  '[UserManager] getUser: user not found in storage',
]

if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : ''
    if (suppressedWarnings.some((text) => message.includes(text))) {
      return
    }
    originalWarn(...args)
  }

  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : ''
    if (suppressedErrors.some((text) => message.includes(text))) {
      return
    }
    originalError(...args)
  }
}

async function getShieldSession(accessToken:string):Promise<string> {
  const isProd = process.env.REACT_APP_OPENFORT_PUBLIC_KEY!.includes('live');

  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL!}/api/protected-create-encryption-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      isProd
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shield session');
  }

  const data = await response.json();
  return data.session;
}

const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  const nav = useNavigate();
  const debugEnabled = process.env.REACT_APP_OPENFORT_DEBUG === 'true';
  
  return (
      <WagmiProvider config={Wagmi.config}>
        <QueryClientProvider 
          client={Query.client}
        >
        <EcosystemProvider
          appName='Rapidfire ID'
          navigateTo={(appState) => {
            nav({
              pathname: appState?.to,
              search: appState?.search
            })
          }}
          theme='midnight'
          logoUrl='https://purple-magnificent-bat-958.mypinata.cloud/ipfs/QmfQrh2BiCzugFauYF9Weu9SFddsVh9qV82uw43cxH8UDV'
          backendUrl={process.env.REACT_APP_BACKEND_URL!}
        >
          <OpenfortProvider
            debugMode={debugEnabled}
            ecosystemId={process.env.REACT_APP_OPENFORT_ECOSYSTEM_ID!}
            onRedirectCallback={(appState) => {
              return nav(appState?.returnTo || window.location.pathname);
            } }
            publishableKey={process.env.REACT_APP_OPENFORT_PUBLIC_KEY!}
            embeddedSignerConfiguration={{
              debug: debugEnabled,
              shieldPublishableKey: process.env.REACT_APP_SHIELD_PUBLIC_KEY!,
              recoveryMethod: RecoveryMethod.AUTOMATIC,
              getEncryptionSessionFn(getAccessToken) {
                return getShieldSession(getAccessToken);
              }
            }} 
            overrides={{}}>
            {children}
          </OpenfortProvider>
          </EcosystemProvider>
        </QueryClientProvider>
      </WagmiProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ProvidersWrapper>
        <App />
      </ProvidersWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
