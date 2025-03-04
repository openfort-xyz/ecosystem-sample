/**
 * Utility functions for formatting addresses and hashes
 */

export const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const truncateHash = (hash: string) => {
  if (!hash) return '';
  return `${hash.slice(0, 7)}...${hash.slice(-6)}`;
};