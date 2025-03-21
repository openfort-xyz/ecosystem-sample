import { 
  WalletGrantPermissions,
  WalletSendCalls, 
  EthRequestAccounts, 
  EthSendTransaction, 
  EthSignTypedDataV4, 
  PersonalSign, 
  WalletShowCalls,
  Settings,
  UnsupportedMethod,
} from '@openfort/ecosystem-js/react';
import { Route, Routes } from 'react-router-dom';
import Loading from './Loading';



function App() {
  return (
    <Routes>
      <Route path='/sign/personal-sign' element={<PersonalSign />} />
      <Route path='/sign/eth-sign-typed-data-v-4' element={<EthSignTypedDataV4 />} />
      <Route path='/sign/eth-send-transaction' element={<EthSendTransaction />} />
      <Route path='/sign/wallet-grant-permissions' element={<WalletGrantPermissions />} />
      <Route path='/sign/wallet-show-calls' element={<WalletShowCalls />} />
      <Route path='/sign/wallet-send-calls' element={<WalletSendCalls />} />
      <Route path='/sign/eth-request-accounts' element={<EthRequestAccounts />} />
      <Route path='/settings' element={<Settings />} />
      <Route path='/' element={<Loading />} />
      
      <Route path='*' element={<UnsupportedMethod />} />
    </Routes>
  );
}

export default App;
