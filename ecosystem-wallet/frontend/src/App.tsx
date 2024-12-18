import { 
  WalletGrantPermissions,
  WalletSendCalls, 
  EthRequestAccounts, 
  EthSendTransaction, 
  EthSignTypedDataV4, 
  FortProvider, 
  PersonalSign, 
  Settings,
  UnsupportedMethod,
  WalletShowCalls
} from '@openfort/ecosystem-js/react';
import { Route, Routes } from 'react-router-dom';
import Loading from './Loading';


// const themeOverride: FortThemeOverride = {
//   colors: {
//     "bg000": "#141519",
//     "bg100": "#141518",
//     "bg200": "#242727",
//     "text": "#8a919e",
//     "title": "#ffffff"
//   }
// }

/*
 * Make a request to your backend and return a session ID
 * @param accessToken 
 * @returns session ID
 */
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

function App() {

  return (
    <FortProvider 
      appName={process.env.REACT_APP_APP_NAME}
      supportedChains={[80002]}
      thirdPartyAuthentication={true}
      logoUrl='https://blog-cms.openfort.xyz/uploads/dos_icon_logo_eb409648a4.svg'
      publishableKey={process.env.REACT_APP_OPENFORT_PUBLIC_KEY!}
      ecosystemId={process.env.REACT_APP_OPENFORT_ECOSYSTEM_ID!}
      shieldConfig={{
        shieldPublishableKey: process.env.REACT_APP_SHIELD_PUBLIC_KEY!,
        getShieldSession: getShieldSession 
      }}
      >
      <Routes>
        <Route path='/sign/personal-sign' element={<PersonalSign />} />
        <Route path='/sign/eth-sign-typed-data-v-4' element={<EthSignTypedDataV4 />} />
        <Route path='/sign/eth-send-transaction' element={<EthSendTransaction />} />
        <Route path='/sign/wallet-grant-permissions' element={<WalletGrantPermissions />} />
        <Route path='/sign/wallet-send-calls' element={<WalletSendCalls />} />
        <Route path='/sign/wallet-show-calls' element={<WalletShowCalls />} />
        <Route path='/sign/eth-request-accounts' element={<EthRequestAccounts />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/sign/loading' element={<Loading />} />
        <Route path='/' element={<Loading />} />
        {/* This should be replaced with <UnsupportedMethod /> on production */}
        <Route path='*' element={<UnsupportedMethod />} />
      </Routes>
    </FortProvider>
  );
}

export default App;
