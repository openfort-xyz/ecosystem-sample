import * as React from "react";
import { useAccount, useChainId } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Modal } from "./Modal";
import { getChainConfig } from "../lib/Wagmi";

interface GetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetModal({ isOpen, onClose }: GetModalProps) {
  const account = useAccount();
  const chainId = useChainId();
  const chain = getChainConfig(chainId);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (account.address) {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Assets">
      <div className="flex flex-col items-center space-y-4">
        {account.address && (
          <>
            <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
              <QRCodeSVG value={account.address} size={200} />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={account.address}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors"
                  type="button"
                >
                  {copied ? (
                    <Check className="size-5" />
                  ) : (
                    <Copy className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              Scan QR code or copy address to receive assets
            </p>

            <div className="w-full pt-4 border-t border-gray-200">
              <p className="text-center text-xs text-gray-400">
                Network: {chain?.name || "Unknown"}
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}


