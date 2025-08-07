import { 
  WalletGrantPermissions,
  WalletSendCalls, 
  EthRequestAccounts, 
  EthSendTransaction, 
  EthSignTypedDataV4, 
  PersonalSign, 
  WalletShowCalls,
  withAuthenticationRequired,
  Settings,
  UnsupportedMethod,
  LoginMethods,
  Recover,
  WalletAddFunds,
  
} from '@openfort/ecosystem-js/react';


import { Route, Routes } from 'react-router-dom';
import Loading from './routes/components/Loading';
import { Home } from './routes/sign/Home';


const ProtectedRoute = ({ component, ...args }: any) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <Loading />,
  });
  return <Component {...args} />;
};

function App() {
  return (
    <Routes>
      <Route path='/sign/personal-sign' element={<ProtectedRoute component={PersonalSign} />} />
      <Route path='/sign/eth-sign-typed-data-v-4' element={<ProtectedRoute component={EthSignTypedDataV4} />} />
      <Route path='/sign/eth-send-transaction' element={<ProtectedRoute component={EthSendTransaction} />} />
      <Route path='/sign/wallet-grant-permissions' element={<ProtectedRoute component={WalletGrantPermissions} />} />
      <Route path='/sign/wallet-show-calls' element={<ProtectedRoute component={WalletShowCalls} />} />
      <Route path='/sign/wallet-send-calls' element={<ProtectedRoute component={WalletSendCalls} />} />
      <Route path='/sign/eth-request-accounts' element={<ProtectedRoute component={EthRequestAccounts} />} />
      <Route path='/sign/settings' element={<ProtectedRoute component={Settings} />} />
      {/* <Route path='/sign/wallet-add-funds' element={<ProtectedRoute component={WalletAddFunds} />} /> */}
      <Route path='/sign/wallet-add-funds' element={<WalletAddFunds />} />
      
      <Route path='/sign/authenticate' element={<LoginMethods />} />
      <Route path='/sign/recover' element={<Recover />} />
      <Route path='/sign/*' element={<UnsupportedMethod />} />
      <Route path='/' element={<Home/>} />
    </Routes>
  );
}

export default App;
