import { Route, Routes } from 'react-router-dom';
import { LoginMethods, Recover, withAuthenticationRequired } from '@openfort/ecosystem-js/react';
import { Home } from './Home';
import Loading from './components/Loading';

const ProtectedRoute = ({ component, ...args }: any) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <Loading />,
  });
  return <Component {...args} />;
};

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/authenticate' element={<LoginMethods />} />
      <Route path='/recover' element={<Recover />} />
    </Routes>
  );
}

export default App;

