import { useRouter } from 'next/router';
import * as React from 'react';
import { Connector, useChainId, useConnect } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';

export function ConnectorsList() {
  const chainId = useChainId();
  const { user } = useAuth();
  const router = useRouter();
  const { connectors, connect, error } = useConnect();
  const [activeConnector, setActiveConnector] = 
    React.useState<Connector | null>(null);

  React.useEffect(() => {
    if (
      error &&
      activeConnector?.id === 'com.rapidfire.id' &&
      error.message ===
        'User not authenticated and third party authentication required.'
    ) {
      router.push('/authentication');
    }
  }, [error, activeConnector, router]);

  const handleConnect = (connector: Connector) => {
    setActiveConnector(connector);
    if(!user) {
      router.push('/authentication');
      return
    }
    connect({ connector, chainId });
  };

  return (
    <div>
      <div className="space-x-2">
        {connectors
          .filter((connector) => !connector.name.includes('Injected'))
          .map((connector) => (
            <ConnectorButton
              key={connector.uid}
              connector={connector}
              onClick={() => handleConnect(connector)}
            />
          ))}
      </div>
      {error && <div className="error">Error: {error.message}</div>}
    </div>
  );
}

function ConnectorButton({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  // Use null as initial state to indicate loading
  const [ready, setReady] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const provider = await connector.getProvider();
        if (mounted) {
          setReady(!!provider);
        }
      } catch (err) {
        if (mounted) {
          setReady(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [connector]);

  // Don't render anything until we know the ready state
  if (ready === null) {
    return null;
  }

  return (
    <button
    className="bg-gray-50 border hover:bg-gray-100 text-black font-bold py-2 px-4 rounded disabled:opacity-50 w-full sm:w-auto"
      disabled={!ready}
      onClick={onClick}
      type="button"
    >
      {ready ? connector.name : 'Loading...'}
    </button>
  );
}