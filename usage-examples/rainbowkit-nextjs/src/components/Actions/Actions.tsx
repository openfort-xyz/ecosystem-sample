import {
  BaseError,
  useAccount, 
  useChainId, 
  useDisconnect,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {  createWalletClient, custom, parseAbi } from 'viem';
import { useShowCallsStatus, useWriteContracts } from 'wagmi/experimental';
import { erc7715Actions } from 'viem/experimental';
import { abi } from '@/src/utils/abi';
import { useCallback, useState } from 'react';
import { useAuthentication } from '@/src/hooks/useAuthentication';
import { ecosystemWalletInstance } from '@/src/utils/ecosystemWallet';

export function Actions() {
  const { connector } = useAccount();
  const { logout } = useAuthentication();
  const [grantPermissionsError, setGrantPermissionsError] = useState<Error | null>(null);
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { data:bundleIdentifier, isPending: callsPending, error: callsError, writeContracts } = useWriteContracts()
  const { showCallsStatus, isPending: bundlePending, error: bundleError} = useShowCallsStatus()
  const { signTypedData, data: typedSignature, isPending: isSigning, error: errorTypedSignature } = useSignTypedData();
  const { signMessage, data: personalSignature, isPending: personalIsSigning, error: errorPersonalSignature } = useSignMessage();
  const { disconnect } = useDisconnect();
  const chainId = useChainId()
  const { chains, switchChain, error: errorChain } = useSwitchChain()

  const handleDisconnectWallet = useCallback(async() => {
    disconnect();
    const provider = await connector?.getProvider();
    if(connector?.id === 'com.rapidfire.id') {
      // even though we are logged out here, the wallet still has the session.
      await logout();
    }
    (provider as any)?.disconnect(); // this is needed because wagmi isn't calling the providers disconnect method
    location.reload();
  }, [disconnect]);

  const handleShowCallsStatus = (inputValue: string) => {
    showCallsStatus({ id: inputValue });
  };

  const handleExampleTx = () => {
    const policy = chainId === polygonAmoy.id ?  process.env.NEXT_PUBLIC_AMOY_POLICY_ID : process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID
    ecosystemWalletInstance.setPolicy(
      {
        policy: policy
      }
    );
    writeContract({
      abi,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      functionName: 'mint',
      args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B'],
    });
  };

  const handleTypedMessage = () => {
    signTypedData({
      domain: {
        chainId: polygonAmoy.id,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      } as const,
      types,
      message: {
        from: { name: 'Alice', wallet: '0x2111111111111111111111111111111111111111' },
        to: { name: 'Bob', wallet: '0x3111111111111111111111111111111111111111' },
        content: 'Hello!',
      },
      primaryType: 'Mail',
    });
  };

  const handlePersonalSign = () => {
    signMessage({ message: 'Hello World' });
  };

  const handleGrantPermissions = async () => {
    const provider = await connector?.getProvider()

    const sessionKey = generatePrivateKey();
    const accountSession = privateKeyToAccount(sessionKey).address;

    const walletClient = createWalletClient({
      chain: polygonAmoy, 
      transport: custom(provider as any),
    }).extend(erc7715Actions()) 
    try {
      await walletClient.grantPermissions({
        signer:{
          type: "account",
          data:{
            id: accountSession
          }
        },
        expiry: 60 * 60 * 24,
        permissions: [
          {
            type: 'contract-call',
            data: {
              address: '0x2522f4fc9af2e1954a3d13f7a5b2683a00a4543a',
              calls: []
            },
            policies: []
          }
        ],
      });
    } catch (error) {
      setGrantPermissionsError(error as Error)
    }
    console.log(`sessionKeyAddress: ${accountSession}`);
  };

  const handleSendCalls = () => {
    writeContracts({
      contracts: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          abi: parseAbi(['function mint(address) returns (bool)']),
          functionName: 'mint',
          args: [
            '0xd2135CfB216b74109775236E36d4b433F1DF507B'
          ],
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          abi: parseAbi(['function mint(address) returns (bool)']),
          functionName: 'mint',
          args: [
            '0xd2135CfB216b74109775236E36d4b433F1DF507B',
          ],
        },
      ],
    })
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
        <div className="mt-4 space-y-6">
          <TransactionSection
            title="eth_sendTransaction"
            hash={hash}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            error={error}
            isPending={isPending}
            handleAction={handleExampleTx}
            buttonText="Example Tx"
          />
          <SignatureSection
            title="eth_signTypedData_v4"
            signature={typedSignature}
            error={errorTypedSignature}
            isPending={isSigning}
            handleAction={handleTypedMessage}
            buttonText="Example Typed Message"
          />
          <SignatureSection
            title="personal_sign"
            signature={personalSignature}
            error={errorPersonalSignature}
            isPending={personalIsSigning}
            handleAction={handlePersonalSign}
            buttonText="Example Message"
          />
          <ActionSection
            title="wallet_grantPermissions"
            handleAction={handleGrantPermissions}
            buttonText="Example Session"
            error={grantPermissionsError}
          />
          <TransactionSection
            title="wallet_sendCalls"
            hash={bundleIdentifier ? `0x${bundleIdentifier}` : undefined}
            isConfirmed={false}
            error={callsError}
            isPending={callsPending}
            isConfirming={false}
            handleAction={handleSendCalls}
            buttonText="Example Batched"
          />
          <InputTransactionSection
            title="wallet_showCallsStatus"
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            error={bundleError}
            isPending={bundlePending}
            handleAction={handleShowCallsStatus}
            buttonText="Show Calls"
            inputLabel="Enter transaction id"
            placeholder="tin_..."
          />
          <div>
            <h2>Switch Chain</h2>
            {chains.map((chain) => (
              <button
                disabled={chainId === chain.id}
                key={chain.id}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed w-full"
                onClick={() => switchChain({ chainId: chain.id })}
                type="button"
              >
                {chain.name}
              </button>
            ))}
            {errorChain?.message}
          </div>
          <ActionSection
            title="disconnect"
            handleAction={handleDisconnectWallet}
            buttonText="Disconnect"
            error={null}
          />
        </div>
    </div>
  );
}

interface TransactionSectionProps {
  title: string;
  hash: `0x${string}` | undefined;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  isPending: boolean;
  handleAction: () => void;
  buttonText: string;
}

function TransactionSection({ title, hash, isConfirming, isConfirmed, error, isPending, handleAction, buttonText }: TransactionSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {hash && <p className="text-sm text-gray-600 mb-2">Transaction Hash: {hash}</p>}
      {isConfirming && <p className="text-sm text-blue-600 mb-2">Waiting for confirmation...</p>}
      {isConfirmed && <p className="text-sm text-green-600 mb-2">Transaction confirmed.</p>}
      {error && <p className="text-sm text-red-600 mb-2">Error: {(error as BaseError).shortMessage || error.message}</p>}
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        disabled={isPending}
        onClick={handleAction}
      >
        {isPending ? 'Confirming...' : buttonText}
      </button>
    </div>
  );
}

interface SignatureSectionProps {
  title: string;
  signature: `0x${string}` | undefined;
  error: Error | null;
  isPending: boolean;
  handleAction: () => void;
  buttonText: string;
}

function SignatureSection({ title, signature, error, isPending, handleAction, buttonText }: SignatureSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {signature && (
        <div className="mb-2">
          <p className="text-sm text-gray-600 font-semibold">Signature:</p>
          <p className="text-xs text-gray-600 break-all">{signature}</p>
        </div>
      )}
      {error && (
        <div className="mb-2">
          <p className="text-sm text-red-600 font-semibold">Error:</p>
          <p className="text-xs text-red-600 break-words">
            {(error as BaseError).shortMessage || error.message}
          </p>
        </div>
      )}
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-full sm:w-auto"
        disabled={isPending}
        onClick={handleAction}
      >
        {isPending ? 'Confirming...' : buttonText}
      </button>
    </div>
  );
}


interface ActionSectionProps {
  title: string;
  handleAction: () => void;
  buttonText: string;
  error: Error | null;
}

function ActionSection({ title, handleAction, buttonText, error }: ActionSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {error && <p className="text-sm text-red-600 mb-2">Error: {(error as BaseError).shortMessage || error.message}</p>}
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleAction}
      >
        {buttonText}
      </button>
    </div>
  );
}

const types = {
  Mail: [
    {name: 'from', type: 'Person'},
    {name: 'to', type: 'Person'},
    {name: 'content', type: 'string'},
  ],
  Person: [
    {name: 'name', type: 'string'},
    {name: 'wallet', type: 'address'},
  ],
};

interface InputTransactionSectionProps {
  title: string;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  isPending: boolean;
  handleAction: (inputValue: string) => void;
  buttonText: string;
  inputLabel: string;
  placeholder: string;
}

function InputTransactionSection({ 
  title, 
  isConfirming, 
  isConfirmed, 
  error, 
  isPending, 
  handleAction, 
  buttonText,
  inputLabel,
  placeholder 
}: InputTransactionSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAction(inputValue.trim());
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {isConfirming && <p className="text-sm text-blue-600 mb-2">Waiting for confirmation...</p>}
      {isConfirmed && <p className="text-sm text-green-600 mb-2">Transaction confirmed.</p>}
      {error && <p className="text-sm text-red-600 mb-2">Error: {(error as BaseError).shortMessage || error.message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="input-field" className="block text-sm font-medium text-gray-700 mb-1">
            {inputLabel}
          </label>
          <input
            id="input-field"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed w-full"
          disabled={isPending || !inputValue.trim()}
        >
          {isPending ? 'Confirming...' : buttonText}
        </button>
      </form>
    </div>
  );
}