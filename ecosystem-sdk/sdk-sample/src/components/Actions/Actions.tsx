import {
  BaseError,
  useAccount, useDisconnect, useEnsName,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { abi } from '@/src/utils/abi';
import { polygonAmoy } from 'wagmi/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { encodeFunctionData } from 'viem';
import { ecosystemWalletInstance } from '@/src/utils/ecosystemWallet';
import { useState } from 'react';

export function Actions() {
  const { connector } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { signTypedData, data: typedSignature, isPending: isSigning, error: errorTypedSignature } = useSignTypedData();
  const { signMessage, data: personalSignature, isPending: personalIsSigning, error: errorPersonalSignature } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [loading, setLoadingState] = useState<boolean>(false);
  const handleExampleTx = () => {
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
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const sessionKeyAddress = await (provider as any).request({ method: 'wallet_grantPermissions', address: account.address, expiry: 60 * 60 * 1000 });
    console.log(`sessionKeyAddress: ${sessionKeyAddress}`);
  };

  const handleSendCalls = async () => {
    const provider = await connector?.getProvider();
    
    const address = await (provider as any).request({
      method: 'wallet_sendCalls',
      calls: [
        { to: "0x6B175474E89094C44Da98b954EedeAC495271d0F", data: encodeFunctionData({ abi, functionName: 'mint', args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B'] }) },
        { to: "0x6B175474E89094C44Da98b954EedeAC495271d0F", data: encodeFunctionData({ abi, functionName: 'mint', args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B'] }) }
      ]
    });
    console.log(`address: ${address}`);
  };

  const ecosystemWalletLogout = async () => {
    setLoadingState(true);
    try {
      disconnect();
      await ecosystemWalletInstance.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoadingState(false);
    }
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
          />
          <ActionSection
            title="wallet_sendCalls"
            handleAction={handleSendCalls}
            buttonText="Example Batched"
          />
          <ActionSection
            title="disconnect"
            handleAction={ecosystemWalletLogout}
            buttonText="Disconnect"
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
}

function ActionSection({ title, handleAction, buttonText }: ActionSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
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