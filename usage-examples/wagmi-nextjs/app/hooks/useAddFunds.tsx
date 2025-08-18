import { useCallback, useState } from 'react';
import { BaseError } from 'wagmi';
import { ecosystemWalletInstance } from "@/app/utils/ecosystemWallet";

export type AddFundsData = {
  hash?: string;
  isConfirmed: boolean;
}

export function useAddFunds(): [
  () => void,
  AddFundsData | undefined,
  boolean,
  BaseError | null
] {
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addFundsData, setAddFundsData] = useState<AddFundsData | undefined>();
  const [addFundsError, setAddFundsError] = useState<BaseError | null>(null);

  const addFunds = useCallback(async () => {
    setIsAddingFunds(true);
    setAddFundsError(null);
    setAddFundsData({
      hash: undefined,
      isConfirmed: false,
    });

    try {
      // Toggle the onramp UI
      let result = await ecosystemWalletInstance.addFunds("toggle");
      if (!result) throw new Error('Failed to get data from onramp');
      let { onrampUrl, transactionHash } = result;

      if (transactionHash) {
        setAddFundsData({ hash: transactionHash, isConfirmed: true });
      } else if (onrampUrl) {
        window.open(onrampUrl, '_blank', 'width=450,height=600,scrollbars=yes,resizable=yes,noopener=true,noreferrer=true');
        
        // Wait for balance update
        result = await ecosystemWalletInstance.addFunds("watch");
        if (!result) throw new Error('Failed to get transaction hash');
        ({ onrampUrl, transactionHash } = result);

        setAddFundsData({ hash: transactionHash, isConfirmed: true });
      } else {
        throw new Error('Failed to get data from onramp');
      }
    } catch (error) {
      setAddFundsError(error as BaseError);
    } finally {
      setIsAddingFunds(false);
    }
  }, []);

  return [addFunds, addFundsData, isAddingFunds, addFundsError];
}
