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
      const response = await ecosystemWalletInstance.addFunds();
      const { clientSecret, sessionId, stripeUrl } = response;

      if (stripeUrl) {
        window.open(stripeUrl, '_blank', 'width=450,height=600,scrollbars=yes,resizable=yes');

        await new Promise((resolve, reject) => {
          const ws = new WebSocket(`ws://localhost:3002`);

          ws.onopen = () => {
            ws.send(JSON.stringify({ sessionId }));
            console.log("WebSocket connection established");
          };

          ws.onmessage = (event) => {
            const { status, transactionDetails } = JSON.parse(event.data);
            console.log("WebSocket message received: ", status);
            switch (status) {
              case 'fulfillment_complete':
                setAddFundsData({
                  hash: transactionDetails.transaction_id,
                  isConfirmed: true,
                });
                ws.close();
                resolve(true);
                break;

              case 'rejected':
                setAddFundsData({
                  hash: undefined,
                  isConfirmed: false,
                });
                ws.close();
                throw new Error('Transaction rejected');
              // Extra: Add more statuses and handle them as needed
            }
          };

          ws.onclose = () => {
            console.log('WebSocket connection closed');
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(new Error('Internal error'));
          };
        });

      } else {
        throw new Error('An error occurred while adding funds');
      }
    } catch (error) {
      setAddFundsError(error as BaseError);
    } finally {
      setIsAddingFunds(false);
    }
  }, []);

  return [addFunds, addFundsData, isAddingFunds, addFundsError];
}
