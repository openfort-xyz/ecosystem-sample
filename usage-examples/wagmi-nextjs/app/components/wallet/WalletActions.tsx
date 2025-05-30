import { Send, MessageSquare, Key, Shield, Boxes } from "lucide-react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignMessage,
  useSignTypedData,
  useAccount,
} from 'wagmi';
import { useWriteContracts } from 'wagmi/experimental'
import { useCallback, useState } from 'react';
import { BaseError, createWalletClient, custom, parseAbi } from 'viem';
import { erc20Abi } from "@/app/utils/abi";
import { baseSepolia } from 'wagmi/chains';
import { erc7715Actions } from "viem/experimental";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSiweMessage } from 'viem/siwe';

export function useWalletActions() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<BaseError | null>(null);
  const { connector, chainId, address, chain } = useAccount();
  // Transaction hooks
  const { data: hash, writeContract, isPending, error  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Signature hooks
  const { signTypedData, data: typedSignature, isPending: isSigningTyped, error: typedError } = useSignTypedData();
  const { signMessage, data: personalSignature, isPending: isSigningPersonal, error: personalError } = useSignMessage();
  // Batched transaction hooks
  const { data: bundleIdentifier, isPending: callsPending, error: callsError, writeContracts } = useWriteContracts();

  // Transaction handlers
  const handleExampleTx = useCallback(() => {
    writeContract({
      abi: erc20Abi,
      address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
      functionName: 'mint',
      args: [1000000000000000000],
    });
  }, [writeContract]);

  const handleTypedMessage = useCallback(() => {
    const types = {
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'content', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    };

    signTypedData({
      domain: {
        chainId: chain?.id,
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
  }, [signTypedData, chain]);

  const handleSIWE = useCallback(() => {
    const message = createSiweMessage({
      domain: window.location.host,
      address: address!,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId: chainId ?? baseSepolia.id,
      nonce: 'deadbeef',
    })
    signMessage({ message: message });
  },[signMessage, chainId, chainId])

  const handlePersonalSign = useCallback(() => {
    signMessage({ message: 'Hello World' });
  }, [signMessage]);

  const handleSendCalls = useCallback(() => {
    writeContracts({
      contracts: [
        {
          address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
          abi: parseAbi(['function mint(uint256)']),
          functionName: 'mint',
          args: [1000000000000000000],
        },
        {
          address: '0xdc2de190a921d846b35eb92d195c9c3d9c08d1c2',
          abi: parseAbi(['function transfer(address,uint256) returns (bool)']),
          functionName: 'transfer',
          args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B',10000000000000000],
        },
      ],
    });
  }, [writeContracts]);

  const handleGrantPermissions = useCallback(async() => {
    const provider = await connector?.getProvider()

    const privateKey = generatePrivateKey();
    const accountSession = privateKeyToAccount(privateKey).address;
    const walletClient = createWalletClient({
      chain: chain, 
      transport: custom(provider as any),
    }).extend(erc7715Actions()) 
    try{
      await walletClient.grantPermissions({
        signer:{
          type: "key",
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
            policies: [
              {
                type: 
                {
                  custom: "usage-limit"
                },
                data: {
                  limit: 10
                }
              }
            ]
          }
        ],
      });
      setSessionKey(accountSession);
    } catch (e) {
      const error = e as BaseError
      setSessionError(error)
    }
  },[connector, chain])


  const actions = [
    {
      icon: Send,
      title: "eth_sendTransaction",
      buttonText: "Mint 1 USDC",
      onClick: handleExampleTx,
      isLoading: isPending,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      error,
      hash,
      isConfirming,
      isConfirmed,
    },
    {
      icon: MessageSquare,
      title: "eth_signTypedData_v4",
      buttonText: "Sign Typed Data",
      onClick: handleTypedMessage,
      isLoading: isSigningTyped,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      error: typedError,
      payload: typedSignature,
    },
    {
      icon: Key,
      title: "personal_sign",
      buttonText: "Sign Message",
      onClick: handlePersonalSign,
      isLoading: isSigningPersonal,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      error: personalError,
      payload: personalSignature,
    },
    {
      icon: Key,
      title: "Authentication",
      buttonText: "Sign in with Ethereum",
      onClick: handleSIWE,
      isLoading: isSigningPersonal,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      error: personalError,
      payload: personalSignature,
    },
    {
      icon: Shield,
      title: "wallet_grantPermissions",
      buttonText: "Grant Session Key",
      error: sessionError,
      onClick: handleGrantPermissions,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      isLoading: false,
      payload: !sessionError && sessionKey? sessionKey : undefined,
    },
    {
      icon: Boxes,
      title: "wallet_sendCalls",
      buttonText: "Send Batch Transaction",
      onClick: handleSendCalls,
      blockExplorerUrl: chain?.blockExplorers?.default.url!,
      isLoading: callsPending,
      error: callsError,
      hash: bundleIdentifier?.id as `0x${string}` | undefined,
    },
  ];

  return { actions };
}