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
      const { stripeUrl } = await ecosystemWalletInstance.addFunds("toggle");
      console.log(stripeUrl)
      if (!stripeUrl || typeof stripeUrl !== 'string') {
        throw new Error('Failed to get data from onramp');
      }
      window.open(stripeUrl, '_blank', 'width=450,height=600,scrollbars=yes,resizable=yes,noopener=true,noreferrer=true');

      // Await for the acc balance to update
      const { transactionHash } = await ecosystemWalletInstance.addFunds("watch");
      setAddFundsData({
        hash: transactionHash,
        isConfirmed: true,
      });
    } catch (error) {
      setAddFundsError(error as BaseError);
    } finally {
      setIsAddingFunds(false);
    }
  }, []);

  return [addFunds, addFundsData, isAddingFunds, addFundsError];
}
