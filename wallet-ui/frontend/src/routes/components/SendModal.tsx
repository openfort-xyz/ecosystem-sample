import * as React from "react";
import { useSendTransaction, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits, Address as ViemAddress } from "viem";
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
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState<string>("");

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

  React.useEffect(() => {
    if (isConfirmed) {
      // Reset form and close modal on success
      setRecipient("");
      setAmount("");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isConfirmed, onClose]);

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

  const isValidAddress = recipient && Address.validate(recipient);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Assets">
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
            onChange={(e) => setSelectedToken(e.target.value)}
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
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <p className="mt-1 text-sm text-gray-500">
              Balance: {Number(selectedAsset.balance) / Math.pow(10, selectedAsset.decimals)}{" "}
              {selectedAsset.symbol}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
            onClick={onClose}
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
              isConfirming
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

