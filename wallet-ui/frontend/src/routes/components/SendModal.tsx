import * as React from "react";
import { useSendTransaction, useAccount, useWaitForTransactionReceipt, useEstimateGas, useGasPrice } from "wagmi";
import { parseEther, parseUnits, Address as ViemAddress, formatEther } from "viem";
import { Address } from "ox";
import { Modal } from "./Modal";
import { useSwapAssets } from "../../hooks/useSwapAssets";
import { useChainId } from "wagmi";
import { Loader2 } from "lucide-react";
import { getChainConfig } from "../../lib/Wagmi";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const account = useAccount();
  const chainId = useChainId();
  const chain = getChainConfig(chainId);
  const { data: assets } = useSwapAssets({ chainId });
  const { sendTransaction, data: hash, isPending, error, reset } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState<string>("");

  // Gas estimation for native ETH transfers
  const { data: gasPrice } = useGasPrice();
  const estimatedGasLimit = BigInt(21000); // Standard ETH transfer gas limit

  React.useEffect(() => {
    if (assets && assets.length > 0 && !selectedToken) {
      // Default to ETH (native token, address 0x0000...)
      const ethToken = assets.find(
        (asset) =>
          asset.address === "0x0000000000000000000000000000000000000000"
      );
      if (ethToken) {
        setSelectedToken(ethToken.address);
      } else {
        setSelectedToken(assets[0].address);
      }
    }
  }, [assets, selectedToken]);

  const handleClose = () => {
    // Reset all form fields and transaction states
    setAmount("");
    reset();
    onClose();
  };

  const handleMaxClick = () => {
    if (!selectedAsset) return;

    const balanceInToken = Number(selectedAsset.balance) / Math.pow(10, selectedAsset.decimals);

    // If sending native ETH, subtract estimated gas fees
    const isNativeEth = selectedToken === "0x0000000000000000000000000000000000000000";
    
    if (isNativeEth) {
      // Use real gas price or fallback to a conservative estimate (50 gwei)
      const fallbackGasPrice = BigInt(50000000000); // 50 gwei in wei
      const currentGasPrice = gasPrice || fallbackGasPrice;
      
      // Calculate estimated gas cost: gasLimit * gasPrice
      // Add 10% safety margin to account for gas price fluctuations
      const estimatedGasCost = (estimatedGasLimit * currentGasPrice * BigInt(110)) / BigInt(100);
      const gasCostInEth = Number(formatEther(estimatedGasCost));
      
      // Subtract gas cost from balance, ensuring we don't go negative
      const maxSendable = Math.max(0, balanceInToken - gasCostInEth);
      setAmount(maxSendable.toString());
    } else {
      // For ERC20 tokens, use full balance
      setAmount(balanceInToken.toString());
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount || !selectedToken) return;

    const selectedAsset = assets?.find(
      (asset) => asset.address === selectedToken
    );
    if (!selectedAsset) return;

    try {
      if (
        selectedToken === "0x0000000000000000000000000000000000000000"
      ) {
        // Send native ETH
        sendTransaction({
          to: recipient as ViemAddress,
          value: parseEther(amount),
        });
      } else {
        // Send ERC20 token
        const tokenAmount = parseUnits(amount, selectedAsset.decimals);
        
        // ERC20 transfer function signature
        const transferData = `0xa9059cbb${recipient.slice(2).padStart(64, "0")}${tokenAmount.toString(16).padStart(64, "0")}`;
        
        sendTransaction({
          to: selectedToken as ViemAddress,
          data: transferData as `0x${string}`,
        });
      }
    } catch (err) {
      console.error("Error sending transaction:", err);
    }
  };

  const selectedAsset = assets?.find(
    (asset) => asset.address === selectedToken
  );

  // Find native ETH balance for gas check
  const nativeEthAsset = assets?.find(
    (asset) => asset.address === "0x0000000000000000000000000000000000000000"
  );
  const nativeEthBalance = nativeEthAsset ? Number(nativeEthAsset.balance) / Math.pow(10, nativeEthAsset.decimals) : 0;
  const hasNoGas = nativeEthBalance === 0;

  // Calculate minimum gas cost for native ETH
  const isNativeEth = selectedToken === "0x0000000000000000000000000000000000000000";
  const fallbackGasPrice = BigInt(50000000000); // 50 gwei
  const currentGasPrice = gasPrice || fallbackGasPrice;
  const estimatedGasCost = (estimatedGasLimit * currentGasPrice * BigInt(110)) / BigInt(100);
  const minGasCostInEth = Number(formatEther(estimatedGasCost));
  const hasInsufficientBalance = isNativeEth && nativeEthBalance > 0 && nativeEthBalance < minGasCostInEth;

  const isValidAddress = recipient && Address.validate(recipient);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send Assets">
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token
          </label>
          <select
            id="token"
            value={selectedToken}
            onChange={(e) => {
              setSelectedToken(e.target.value);
              setAmount("");
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {assets?.map((asset) => (
              <option key={asset.address} value={asset.address}>
                {asset.name} ({asset.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          {recipient && !isValidAddress && (
            <p className="mt-1 text-sm text-red-600">Invalid address</p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount
          </label>
          <div className="relative">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string, numbers, and one decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                }
              }}
              placeholder="0.0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            {selectedAsset && (
              <div className="absolute right-3 top-2 text-sm text-gray-500">
                {selectedAsset.symbol}
              </div>
            )}
          </div>
          {selectedAsset && (
            <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
              <span>
                Balance: {Number(selectedAsset.balance) / Math.pow(10, selectedAsset.decimals)}{" "}
                {selectedAsset.symbol}
              </span>
              <button
                type="button"
                onClick={handleMaxClick}
                className="px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                max
              </button>
            </div>
          )}
        </div>

        {hasNoGas && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="font-medium">Insufficient gas balance</p>
                <p className="mt-1 text-xs">
                  You have 0 ETH balance. You need ETH to pay for gas fees to send transactions.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasInsufficientBalance && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="font-medium">Balance too low</p>
                <p className="mt-1 text-xs">
                  Your ETH balance ({nativeEthBalance.toFixed(8)} ETH) is less than the estimated gas cost ({minGasCostInEth.toFixed(8)} ETH). You cannot send any ETH.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 max-h-40 overflow-y-auto">
            Error: {error.message}
          </div>
        )}

        {isConfirmed && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            Transaction confirmed!
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              !recipient ||
              !amount ||
              !isValidAddress ||
              isPending ||
              isConfirming ||
              hasNoGas ||
              hasInsufficientBalance
            }
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isPending ? "Sending..." : "Confirming..."}
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 mt-4">
          <p className="text-center text-xs text-gray-400">
            Network: {chain?.name || "Unknown"}
          </p>
        </div>
      </form>
    </Modal>
  );
}

