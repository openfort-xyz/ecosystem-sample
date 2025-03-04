import { EXPLORER_BASE_URL } from '../constants';

/**
 * Utility functions for explorer-related operations
 */

export const getExplorerUrl = (
  addressOrHash: string, 
  type: 'address' | 'tx' = 'address'
) => {
  return `${EXPLORER_BASE_URL}/${type}/${addressOrHash}`;
};