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
  Recover
} from '@openfort/ecosystem-js/react';
import { Route, Routes } from 'react-router-dom';
import Loading from './Loading';


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
      <Route path='/settings' element={<ProtectedRoute component={Settings} />} />
      <Route path='/' element={<ProtectedRoute component={Loading} />} />
      
      <Route path='/authenticate' element={<LoginMethods />} />
      <Route path='/recover' element={<Recover />} />
      <Route path='*' element={<UnsupportedMethod />} />
    </Routes>
  );
}

export default App;
