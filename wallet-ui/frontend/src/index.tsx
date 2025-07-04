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

async function getShieldSession(accessToken:string):Promise<string> {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL!}/api/protected-create-encryption-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shield session');
  }

  const data = await response.json();
  return data.session;
}

const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  const nav = useNavigate();
  
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
        >
          <OpenfortProvider
            thirdPartyAuthentication={false}
            debugMode={true}
            ecosystemId={process.env.REACT_APP_OPENFORT_ECOSYSTEM_ID!}
            onRedirectCallback={(appState) => {
              return nav(appState?.returnTo || window.location.pathname);
            } }
            publishableKey={process.env.REACT_APP_OPENFORT_PUBLIC_KEY!}
            embeddedSignerConfiguration={{
              debug: true,
              shieldPublishableKey: process.env.REACT_APP_SHIELD_PUBLIC_KEY!,
              recoveryMethod: RecoveryMethod.AUTOMATIC,
              getEncryptionSessionFn(getAccessToken) {
                return getShieldSession(getAccessToken);
              }
            }} 
            overrides={{}}          >
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
    <BrowserRouter>
      <ProvidersWrapper>
        <App />
      </ProvidersWrapper>
    </BrowserRouter>
  </React.StrictMode>
);